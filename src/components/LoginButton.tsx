"use client";

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="inline-flex w-full items-center justify-center px-6 py-3 text-xs font-light text-slate-900 bg-white border border-white rounded-none hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 tracking-wide"
    >
      LOG IN
    </a>
  );
}
