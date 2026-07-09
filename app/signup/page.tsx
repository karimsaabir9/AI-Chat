"use client";

import { useForm } from "react-hook-form";
import { signup } from "@/server/user";
import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

const SignupPage = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    signup(data.email, data.password)
      .then(() => {
        setSuccess("Account created successfully");
        setError("");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign up to start chatting with your AI assistant
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
                  disabled={isSubmitting}
                  {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">Please enter a valid email address</p>
              )}
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
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register("password", {
                    required: true,
                    minLength: 2,
                    maxLength: 20,
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">Password must be 2-20 characters</p>
              )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-rose-600 hover:text-rose-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
