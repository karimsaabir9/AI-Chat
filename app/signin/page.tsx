"use client";

import { useForm } from "react-hook-form";
import { login } from "@/server/user";
import { Suspense, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  // Guests coming from the guest chat are sent back to /chat so their
  // in-progress conversation can be imported; everyone else goes to the
  // dashboard, same as before.
  const isFromGuest = searchParams.get("from") === "guest";
  const destination = isFromGuest ? "/chat?importGuest=1" : "/dashboard";

  const onSubmit = (data: any) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    login(data.email, data.password)
      .then(() => {
        setSuccess("Login successful");
        redirect(destination);
      })
      .catch((error) => {
        setError(error.message);
        setSuccess("");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn.social({ provider: "google", callbackURL: destination }).finally(() => {
      setIsGoogleLoading(false);
    });
  };

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to continue to your AI Chat workspace
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-lg shadow-rose-100/50 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                  type="email"
                  autoComplete="email"
                  disabled={isBusy}
                  {...register("email")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                  type="password"
                  autoComplete="current-password"
                  disabled={isBusy}
                  {...register("password")}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isBusy}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="relative my-1 flex items-center">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isBusy}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-rose-600 hover:text-rose-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

const SignInSkeleton = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 py-12">
    <div className="w-full max-w-sm animate-pulse">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 h-12 w-12 rounded-xl bg-rose-200" />
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-100" />
      </div>
      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-lg shadow-rose-100/50 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="h-11 rounded-xl bg-gray-100" />
          <div className="h-11 rounded-xl bg-gray-100" />
          <div className="h-11 rounded-xl bg-rose-100" />
          <div className="h-11 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  </div>
);

const SignInPage = () => (
  <Suspense fallback={<SignInSkeleton />}>
    <LoginPage />
  </Suspense>
);

export default SignInPage;
