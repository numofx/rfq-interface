 "use client";

import { useState } from "react";
import Image from "next/image";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f3f4] text-[#15151b]">
      <header className="relative flex items-center px-7 pt-6">
        <div className="relative h-[44px] w-[165px]">
          <Image src="/numo.png" alt="Numo" fill className="object-contain object-left" priority />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 rounded-[18px] bg-[#e5e5e7] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <div className="flex items-center gap-1 text-[18px] leading-none">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`rounded-[14px] px-9 py-3 ${
                activeTab === "login"
                  ? "bg-[#f5f5f6] font-semibold text-[#141419] shadow-sm"
                  : "font-medium text-[#666674]"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`rounded-[14px] px-9 py-3 ${
                activeTab === "signup"
                  ? "bg-[#f5f5f6] font-semibold text-[#141419] shadow-sm"
                  : "font-medium text-[#666674]"
              }`}
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-[155px] flex w-full justify-center px-6 pb-10">
        <section className="w-full max-w-[500px]">
          {activeTab === "login" ? (
            <>
              <h1 className="mb-7 text-[30px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                Log in
              </h1>

              <form className="space-y-4" aria-label="Login form">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-[56px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="flex h-[56px] items-center rounded-[16px] border-2 border-[#141419] bg-[#ececef] px-4">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-full w-full bg-transparent text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-3 flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#f7f7f7]"
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
                  className="h-[56px] w-full rounded-[16px] bg-gradient-to-r from-[#111118] to-[#171722] text-[18px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                >
                  Log in &rarr;
                </button>
              </form>

              <p className="mt-[58px] text-center text-[19px] text-[#8f9099]">
                Forgot your password?
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-7 text-[30px] leading-none font-semibold tracking-[-0.02em] text-[#131318]">
                Create an account
              </h1>

              <form className="space-y-4" aria-label="Sign up form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="sr-only">
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      placeholder="Enter your first name"
                      className="h-[56px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
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
                      className="h-[56px] w-full rounded-[16px] border border-[#e7e7ea] bg-[#e8e8eb] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
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
                    className="h-[56px] w-full rounded-[16px] border-2 border-[#141419] bg-[#ececef] px-4 text-[16px] text-[#202026] placeholder:text-[#9697a4] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="h-[56px] w-full rounded-[16px] bg-gradient-to-r from-[#111118] to-[#171722] text-[18px] font-semibold text-[#f2f2f4] shadow-[0_2px_0_rgba(0,0,0,0.08)]"
                >
                  Continue &rarr;
                </button>
              </form>

              <p className="mt-[58px] text-center text-[19px] text-[#8f9099]">
                Do you have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="font-semibold text-[#131318]"
                >
                  Login
                </button>
              </p>
            </>
          )}

          <div className="mt-[38px] text-center text-[15px] leading-[1.35] text-[#8f9099]">
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
        </section>
      </main>
    </div>
  );
}
