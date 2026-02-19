"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout, CardWrapper, ContentLayout, containerClass } from "@/components/layout/page-shell";
import { supabase } from "@/lib/supabase/client";

type View = "login" | "signup" | "password" | "verify" | "team";
type LoginErrorField = "email" | "password" | null;

const getReadableAuthError = (message: string) => {
  const normalized = message.toLowerCase();
  const domainNotVerifiedMatch = message.match(/550 The ([^ ]+) domain is not verified/i);

  if (domainNotVerifiedMatch) {
    const failedDomain = domainNotVerifiedMatch[1];
    return `Email sender domain mismatch: ${failedDomain} is not verified in Resend. In Supabase Auth email settings, use a sender from your verified domain/subdomain (for example @noreply.numofx.com), or verify ${failedDomain} in Resend.`;
  }

  if (normalized.includes("confirmation email") || normalized.includes("smtp")) {
    return "We couldn't send the verification email. Check your Supabase Auth email provider/SMTP settings and try again.";
  }
  if (normalized.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (normalized.includes("network")) {
    return "Network error while reaching authentication services. Please try again.";
  }

  return message;
};

const getAuthRedirectUrl = () => {
  const explicitRedirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL?.trim();
  if (explicitRedirectUrl) {
    return explicitRedirectUrl;
  }

  const origin = window.location.origin;
  if (origin === "http://rfq.numofx.com") {
    return "https://rfq.numofx.com/auth/callback";
  }

  return `${origin}/auth/callback`;
};

const checkEmailExists = async (email: string) => {
  const response = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Failed to check email.");
  }

  const payload = (await response.json()) as { exists?: boolean };
  return Boolean(payload.exists);
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState("");
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [contactValue, setContactValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loginErrorField, setLoginErrorField] = useState<LoginErrorField>(null);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const isLoginEmailError = view === "login" && loginErrorField === "email";
  const isLoginPasswordError = view === "login" && loginErrorField === "password";

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (!verified) return;
    if (!supabase) {
      setAuthError("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          setView("team");
        }
      })
      .catch(() => {
        setAuthError("We couldn’t confirm your session yet. Please try again.");
      });
  }, [searchParams]);

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isAuthBusy) return;
    setAuthError("");
    setStatusMessage("");
    if (!signupEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }

    try {
      setIsAuthBusy(true);
      const exists = await checkEmailExists(signupEmail.trim());
      if (exists) {
        setAuthError("This email is already registered. Please log in.");
        return;
      }
    } catch {
      setAuthError("We couldn't verify this email right now. If you already have an account, please log in.");
      return;
    } finally {
      setIsAuthBusy(false);
    }

    setView("password");
  };

  const handleForgotPassword = async () => {
    setAuthError("");
    setStatusMessage("");
    if (!supabase) {
      setAuthError("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    if (!loginEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }

    try {
      setIsAuthBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) {
        setAuthError(getReadableAuthError(error.message));
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase resetPasswordForEmail error:", error);
        }
        return;
      }
      setStatusMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setAuthError("Unexpected error while sending the reset email. Please try again.");
      if (process.env.NODE_ENV !== "production") {
        console.error("Unexpected resetPasswordForEmail failure:", error);
      }
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setLoginErrorField(null);
    setLoginErrorMessage("");
    setStatusMessage("");
    if (!supabase) {
      setAuthError("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    if (!loginEmail.trim()) {
      setLoginErrorField("email");
      setLoginErrorMessage("Please enter your email address.");
      return;
    }
    if (!loginPassword.trim()) {
      setLoginErrorField("password");
      setLoginErrorMessage("Please enter your password.");
      return;
    }

    try {
      setIsAuthBusy(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        const code = (error.code ?? "").toLowerCase();
        const message = error.message.toLowerCase();
        const isInvalidEmail =
          code.includes("email_not_found") ||
          code.includes("user_not_found") ||
          message.includes("email not found") ||
          message.includes("user not found") ||
          message.includes("no user");
        const isInvalidPassword =
          code === "invalid_credentials" ||
          code === "invalid_grant" ||
          message.includes("invalid login credentials") ||
          message.includes("invalid credentials") ||
          message.includes("invalid password");

        if (isInvalidEmail) {
          setLoginErrorField("email");
          setLoginErrorMessage("Invalid email address");
        } else if (isInvalidPassword) {
          try {
            const exists = await checkEmailExists(loginEmail.trim());
            if (exists) {
              setLoginErrorField("password");
              setLoginErrorMessage("Invalid password");
            } else {
              setLoginErrorField("email");
              setLoginErrorMessage("Invalid email address");
            }
          } catch {
            // When lookup is unavailable, default to password error on invalid credentials.
            setLoginErrorField("password");
            setLoginErrorMessage("Invalid password");
          }
        } else {
          setAuthError(getReadableAuthError(error.message));
        }
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase signIn error:", error);
        }
        return;
      }

      router.push("/app");
    } catch (error) {
      setLoginErrorField("password");
      setLoginErrorMessage("Invalid password");
      if (process.env.NODE_ENV !== "production") {
        console.error("Unexpected signIn failure:", error);
      }
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setStatusMessage("");
    if (!supabase) {
      setAuthError("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    if (!signupEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }
    if (!newPassword.trim()) {
      setAuthError("Please create a password.");
      return;
    }

    try {
      setIsAuthBusy(true);
      const { error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: newPassword,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });

      if (error) {
        setAuthError(getReadableAuthError(error.message));
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase signUp error:", error);
        }
        return;
      }

      setView("verify");
    } catch (error) {
      setAuthError("Unexpected error while creating your account. Please try again.");
      if (process.env.NODE_ENV !== "production") {
        console.error("Unexpected signUp failure:", error);
      }
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleVerificationContinue = async () => {
    setAuthError("");
    if (!supabase) {
      setAuthError("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setView("team");
      return;
    }
    setAuthError("We couldn’t confirm your email yet. Please check your inbox.");
  };

  const handleResendVerification = async () => {
    setAuthError("");
    setStatusMessage("");
    if (!supabase) {
      setAuthError("Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    if (!signupEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: signupEmail.trim(),
      });
      if (error) {
        setAuthError(getReadableAuthError(error.message));
        if (process.env.NODE_ENV !== "production") {
          console.error("Supabase resend error:", error);
        }
        return;
      }
      setStatusMessage("Verification email sent.");
    } catch (error) {
      setAuthError("Unexpected error while resending verification email. Please try again.");
      if (process.env.NODE_ENV !== "production") {
        console.error("Unexpected resend failure:", error);
      }
    }
  };

  const headerTabs =
    view !== "team" ? (
      <div className="rounded-[12px] bg-[#e5e5e7] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="flex items-center gap-1 text-[14px] leading-none">
          <button
            type="button"
            onClick={() => setView("login")}
            className={`rounded-[10px] px-6 py-2 ${
              view === "login"
                ? "bg-[#f5f5f6] font-semibold text-[#141419] shadow-sm"
                : "font-medium text-[#666674]"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setView("signup")}
            className={`rounded-[10px] px-6 py-2 ${
              view === "signup" || view === "password" || view === "verify"
                ? "bg-[#f5f5f6] font-semibold text-[#141419] shadow-sm"
                : "font-medium text-[#666674]"
            }`}
          >
            Sign up
          </button>
        </div>
      </div>
    ) : null;

  return (
    <AppLayout headerCenter={headerTabs}>
      {view === "team" ? (
        <>
          <ContentLayout variant="default" className="flex justify-center pt-6 pb-16">
            <CardWrapper size="auth" className="max-w-[420px]">
              <h1 className="mb-4 text-[24px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                Create a team
              </h1>

              <p className="mb-6 max-w-[520px] text-[13px] leading-[1.4] text-[#9a9ba7]">
                You&apos;re creating a team on Numo. You may invite your teammates to collaborate with you after signup.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter team name"
                  className="h-[44px] w-full rounded-[12px] border border-[#e7e7ea] bg-[#e8e8eb] px-3 text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBusinessMenuOpen((prev) => !prev)}
                    className={`flex h-[44px] w-full items-center justify-between rounded-[12px] px-3 text-[13px] font-medium focus:outline-none ${
                      businessType ? "text-[#202026]" : "text-[#9697a4]"
                    }`}
                  >
                    <span>
                      {businessType
                        ? businessType === "carry-trader"
                          ? "Carry Trader"
                          : businessType.charAt(0).toUpperCase() + businessType.slice(1)
                        : "What is your business?"}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition-transform ${isBusinessMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {isBusinessMenuOpen ? (
                    <div className="absolute left-0 top-[50px] z-20 w-[360px] rounded-[16px] bg-[#f4f4f5] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                      <div className="space-y-4 text-[14px] font-medium text-[#111116]">
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType("microlender");
                            setIsBusinessMenuOpen(false);
                          }}
                          className="block text-left hover:opacity-80"
                        >
                          Microlender
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType("carry-trader");
                            setIsBusinessMenuOpen(false);
                          }}
                          className="block text-left hover:opacity-80"
                        >
                          Carry Trader
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType("importer");
                            setIsBusinessMenuOpen(false);
                          }}
                          className="block text-left hover:opacity-80"
                        >
                          Importer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType("exporter");
                            setIsBusinessMenuOpen(false);
                          }}
                          className="block text-left hover:opacity-80"
                        >
                          Exporter
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType("other");
                            setIsBusinessMenuOpen(false);
                          }}
                          className="block text-left hover:opacity-80"
                        >
                          Other
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsContactMenuOpen((prev) => !prev)}
                    className={`flex h-[44px] w-full items-center justify-between rounded-[12px] px-3 text-[13px] font-medium focus:outline-none ${
                      contactMethod ? "text-[#202026]" : "text-[#9697a4]"
                    }`}
                  >
                    <span>
                      {contactMethod
                        ? contactMethod === "phone"
                          ? "Phone Number"
                          : "Email"
                        : "How should we connect with you?"}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition-transform ${isContactMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {isContactMenuOpen ? (
                    <div className="absolute left-0 top-[50px] z-20 w-[380px] rounded-[16px] bg-[#f4f4f5] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                      <div className="space-y-4 text-[14px] font-medium text-[#111116]">
                        <button
                          type="button"
                          onClick={() => {
                            setContactMethod("email");
                            setContactValue("");
                            setIsContactMenuOpen(false);
                          }}
                          className="block w-full text-left hover:opacity-80"
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setContactMethod("phone");
                            setContactValue("");
                            setIsContactMenuOpen(false);
                          }}
                          className="block w-full text-left hover:opacity-80"
                        >
                          Phone Number
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {contactMethod ? (
                  <input
                    type={contactMethod === "email" ? "email" : "tel"}
                    value={contactValue}
                    onChange={(event) => setContactValue(event.target.value)}
                    placeholder={contactMethod === "email" ? "Enter your email" : "Enter phone number"}
                    className="h-[44px] w-full rounded-[12px] border-2 border-[#141419] bg-[#ececef] px-3 text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="h-[44px] w-full rounded-[12px] bg-gradient-to-r from-[#111118] to-[#171722] text-[13px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                >
                  Finish Setup &rarr;
                </button>
              </div>
            </CardWrapper>
          </ContentLayout>

          <footer className="pointer-events-none fixed inset-x-0 bottom-0 px-4 pb-4">
            <div className={`${containerClass} relative flex items-end justify-between text-[#8f9099]`}>
              <div className="pointer-events-auto text-left text-[11px] leading-[1.2]">
                <p>Logged in as:</p>
                <p className="mt-1 text-[11px] font-semibold text-[#141419]">
                  {signupEmail.trim() || "r.leifke@gmail.com"}
                </p>
              </div>

              <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 text-[10px]">
                <div className="flex items-center gap-3">
                  <a href="#" className="hover:text-[#70707a]">
                    Privacy Policy
                  </a>
                  <span aria-hidden="true">&middot;</span>
                  <a href="#" className="hover:text-[#70707a]">
                    Cookie Policy
                  </a>
                </div>
              </div>

              <button type="button" className="pointer-events-auto text-[14px] text-[#141419]">
                Log out
              </button>
            </div>
          </footer>
        </>
      ) : (
        <ContentLayout variant="auth">
          <CardWrapper size="auth" className="max-w-sm">
            {view === "login" ? (
              <>
                <div className="space-y-5">
                  <h1 className="text-[26px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                    Log in
                  </h1>

                  <form className="space-y-4" aria-label="Login form" onSubmit={handleLoginSubmit}>
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={loginEmail}
                        onChange={(event) => {
                          setLoginEmail(event.target.value);
                          setLoginErrorField(null);
                          setLoginErrorMessage("");
                        }}
                        className={`h-[42px] w-full rounded-[12px] border-2 bg-[#e8e8eb] px-3 text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none ${
                          isLoginEmailError ? "border-[#b42318]" : "border-[#e7e7ea]"
                        }`}
                      />
                      {isLoginEmailError ? <p className="mt-2 text-[12px] text-[#b42318]">{loginErrorMessage}</p> : null}
                    </div>

                    <div>
                      <label htmlFor="password" className="sr-only">
                        Password
                      </label>
                      <div
                        className={`flex h-[42px] items-center rounded-[12px] border-2 bg-[#ececef] px-3 ${
                          isLoginPasswordError ? "border-[#b42318]" : "border-[#141419]"
                        }`}
                      >
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(event) => {
                            setLoginPassword(event.target.value);
                            setLoginErrorField(null);
                            setLoginErrorMessage("");
                          }}
                          className="h-full w-full bg-transparent text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="ml-2 flex h-[28px] w-[28px] items-center justify-center rounded-[9px] bg-[#f7f7f7]"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-[12px] w-[12px] text-[#1c1c21]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                            {showPassword ? <path d="M3 3l18 18" /> : null}
                          </svg>
                        </button>
                      </div>
                      {isLoginPasswordError ? (
                        <p className="mt-2 text-[12px] text-[#b42318]">{loginErrorMessage}</p>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthBusy}
                      className="h-[42px] w-full rounded-[12px] bg-gradient-to-r from-[#111118] to-[#171722] text-[14px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                    >
                      Log in &rarr;
                    </button>
                  </form>

                  {statusMessage ? <p className="text-[12px] text-[#4b5d4b]">{statusMessage}</p> : null}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="w-full text-center text-[14px] text-[#8f9099] hover:text-[#6f707a]"
                  >
                    Forgot your password?
                  </button>
                </div>
              </>
            ) : view === "signup" ? (
              <>
                <div className="space-y-5">
                  <h1 className="text-[26px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                    Create an account
                  </h1>

                  <form className="space-y-4" aria-label="Sign up form" onSubmit={handleSignupSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first-name" className="sr-only">
                          First name
                        </label>
                        <input
                          id="first-name"
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="h-[42px] w-full rounded-[12px] border border-[#e7e7ea] bg-[#e8e8eb] px-3 text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="last-name" className="sr-only">
                          Last name
                        </label>
                        <input
                          id="last-name"
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className="h-[42px] w-full rounded-[12px] border border-[#e7e7ea] bg-[#e8e8eb] px-3 text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={signupEmail}
                        disabled={isAuthBusy}
                        onChange={(event) => {
                          setSignupEmail(event.target.value);
                          setAuthError("");
                        }}
                        className={`h-[42px] w-full rounded-[12px] border-2 bg-[#ececef] px-3 text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none ${
                          authError ? "border-[#b42318]" : "border-[#141419]"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthBusy}
                      className="h-[42px] w-full rounded-[12px] bg-gradient-to-r from-[#111118] to-[#171722] text-[14px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isAuthBusy ? "Checking..." : "Continue →"}
                    </button>
                  </form>

                  {authError ? <p className="text-[12px] text-[#b42318]">{authError}</p> : null}
                  <p className="text-center text-[14px] text-[#8f9099]">
                    Do you have an account?{" "}
                    <button type="button" onClick={() => setView("login")} className="font-semibold text-[#131318]">
                      Login
                    </button>
                  </p>
                </div>
              </>
            ) : view === "verify" ? (
              <>
                <div className="space-y-5 text-center">
                  <h1 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.02em] text-[#131318]">
                    First, let&apos;s verify your email
                  </h1>

                  <p className="text-[14px] leading-[1.5] text-[#3a3b43]">
                    Check{" "}
                    <span className="font-semibold text-[#141419]">
                      {signupEmail.trim() || "your inbox"}
                    </span>{" "}
                    to verify your account and get started.
                  </p>

                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="h-[42px] w-full rounded-[12px] bg-[#e5e5e8] text-[14px] font-semibold text-[#141419]"
                  >
                    Resend verification email
                  </button>

                  <button
                    type="button"
                    onClick={handleVerificationContinue}
                    className="text-[13px] font-medium text-[#6f717b] hover:text-[#444551]"
                  >
                    I&apos;ve verified &mdash; continue
                  </button>

                  {statusMessage ? <p className="text-[12px] text-[#4b5d4b]">{statusMessage}</p> : null}
                  {authError ? <p className="text-[12px] text-[#b42318]">{authError}</p> : null}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#ededf0] text-[16px] text-[#15151b] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                    aria-label="Back to sign up"
                  >
                    &larr;
                  </button>

                  <h1 className="text-[26px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                    Create your password
                  </h1>

                  <form className="space-y-4" aria-label="Create password form" onSubmit={handlePasswordSubmit}>
                    <div>
                      <label htmlFor="new-password" className="sr-only">
                        Password
                      </label>
                      <div className="flex h-[42px] items-center rounded-[12px] border border-[#e7e7ea] bg-[#efeff2] px-3">
                        <input
                          id="new-password"
                          type={showCreatePassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Enter your password"
                          className="h-full w-full bg-transparent text-[13px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword((prev) => !prev)}
                          className="ml-2 flex h-[28px] w-[28px] items-center justify-center rounded-[9px] bg-[#ffffff]"
                          aria-label={showCreatePassword ? "Hide password" : "Show password"}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-[12px] w-[12px] text-[#1c1c21]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                            {showCreatePassword ? <path d="M3 3l18 18" /> : null}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthBusy}
                      className="h-[42px] w-full rounded-[12px] bg-gradient-to-r from-[#111118] to-[#171722] text-[14px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                    >
                      {isAuthBusy ? "Creating..." : "Continue →"}
                    </button>
                  </form>

                  {authError ? <p className="text-[12px] text-[#b42318]">{authError}</p> : null}
                </div>
              </>
            )}

            <div className="mt-6 text-center text-[12px] leading-[1.35] text-[#8f9099]">
              <p>
                This site is protected by reCAPTCHA and the
                <br />
                Google Privacy Policy and Terms of Service apply.
              </p>
            </div>

            <div className="mt-4 flex justify-center gap-3 text-[12px] text-[#8f9099]">
              <a href="#" className="hover:text-[#70707a]">
                Privacy Policy
              </a>
              <span aria-hidden="true">&middot;</span>
              <a href="#" className="hover:text-[#70707a]">
                Cookie Policy
              </a>
            </div>
          </CardWrapper>
        </ContentLayout>
      )}
    </AppLayout>
  );
}
