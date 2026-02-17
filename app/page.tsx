"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout, CardWrapper, ContentLayout, containerClass } from "@/components/layout/page-shell";

type View = "login" | "signup" | "team";

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState("");
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [contactValue, setContactValue] = useState("");

  const handleSignupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setView("team");
  };

  const headerTabs =
    view !== "team" ? (
      <div className="rounded-[18px] bg-[#e5e5e7] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="flex items-center gap-1 text-[18px] leading-none">
          <button
            type="button"
            onClick={() => setView("login")}
            className={`rounded-[14px] px-9 py-3 ${
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
            className={`rounded-[14px] px-9 py-3 ${
              view === "signup"
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
          <ContentLayout variant="default" className="flex justify-center pt-10 pb-24">
            <CardWrapper size="auth" className="max-w-[540px]">
              <h1 className="mb-5 text-[32px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                Create a team
              </h1>

              <p className="mb-8 max-w-[520px] text-[17px] leading-[1.4] text-[#9a9ba7]">
                You&apos;re creating a team on Numo. You may invite your teammates to collaborate with you after signup.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter team name"
                  className="h-[56px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBusinessMenuOpen((prev) => !prev)}
                    className={`flex h-[56px] w-full items-center justify-between rounded-[16px] px-4 text-[16px] font-medium focus:outline-none ${
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
                      className={`h-5 w-5 transition-transform ${isBusinessMenuOpen ? "rotate-180" : ""}`}
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
                    <div className="absolute left-0 top-[62px] z-20 w-[450px] rounded-[26px] bg-[#f4f4f5] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                      <div className="space-y-6 text-[20px] font-medium text-[#111116]">
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
                    className={`flex h-[56px] w-full items-center justify-between rounded-[16px] px-4 text-[16px] font-medium focus:outline-none ${
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
                      className={`h-5 w-5 transition-transform ${isContactMenuOpen ? "rotate-180" : ""}`}
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
                    <div className="absolute left-0 top-[62px] z-20 w-[540px] rounded-[26px] bg-[#f4f4f5] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                      <div className="space-y-6 text-[20px] font-medium text-[#111116]">
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
                    className="h-[56px] w-full rounded-[16px] border-2 border-[#141419] bg-[#ececef] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="h-[56px] w-full rounded-[16px] bg-gradient-to-r from-[#111118] to-[#171722] text-[16px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                >
                  Finish Setup &rarr;
                </button>
              </div>
            </CardWrapper>
          </ContentLayout>

          <footer className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
            <div className={`${containerClass} relative flex items-end justify-between text-[#8f9099]`}>
              <div className="pointer-events-auto text-left text-[14px] leading-[1.2]">
                <p>Logged in as:</p>
                <p className="mt-1 text-[13px] font-semibold text-[#141419]">
                  {signupEmail.trim() || "r.leifke@gmail.com"}
                </p>
              </div>

              <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 text-[12px]">
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-[#70707a]">
                    Privacy Policy
                  </a>
                  <span aria-hidden="true">&middot;</span>
                  <a href="#" className="hover:text-[#70707a]">
                    Cookie Policy
                  </a>
                </div>
              </div>

              <button type="button" className="pointer-events-auto text-[18px] text-[#141419]">
                Log out
              </button>
            </div>
          </footer>
        </>
      ) : (
        <ContentLayout variant="auth">
          <CardWrapper size="auth">
            {view === "login" ? (
              <>
                <h1 className="mb-6 text-[30px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                  Log in
                </h1>

                <form className="space-y-3" aria-label="Login form" onSubmit={(event) => event.preventDefault()}>
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="h-[54px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <div className="flex h-[54px] items-center rounded-[16px] border-2 border-[#141419] bg-[#ececef] px-4">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-full w-full bg-transparent text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="ml-3 flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#f7f7f7]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-[15px] w-[15px] text-[#1c1c21]"
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
                  </div>

                  <button
                    type="submit"
                    className="h-[54px] w-full rounded-[16px] bg-gradient-to-r from-[#111118] to-[#171722] text-[18px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                  >
                    Log in &rarr;
                  </button>
                </form>

                <p className="mt-12 text-center text-[19px] text-[#8f9099]">Forgot your password?</p>
              </>
            ) : (
              <>
                <h1 className="mb-6 text-[30px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                  Create an account
                </h1>

                <form className="space-y-3" aria-label="Sign up form" onSubmit={handleSignupSubmit}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="first-name" className="sr-only">
                        First name
                      </label>
                      <input
                        id="first-name"
                        type="text"
                        placeholder="Enter your first name"
                        className="h-[54px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
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
                        className="h-[54px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
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
                      onChange={(event) => setSignupEmail(event.target.value)}
                      className="h-[54px] w-full rounded-[16px] border-2 border-[#141419] bg-[#ececef] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-[54px] w-full rounded-[16px] bg-gradient-to-r from-[#111118] to-[#171722] text-[18px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                  >
                    Continue &rarr;
                  </button>
                </form>

                <p className="mt-12 text-center text-[19px] text-[#8f9099]">
                  Do you have an account?{" "}
                  <button type="button" onClick={() => setView("login")} className="font-semibold text-[#131318]">
                    Login
                  </button>
                </p>
              </>
            )}

            <div className="mt-8 text-center text-[15px] leading-[1.35] text-[#8f9099]">
              <p>
                This site is protected by reCAPTCHA and the
                <br />
                Google Privacy Policy and Terms of Service apply.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-4 text-[14px] text-[#8f9099]">
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
