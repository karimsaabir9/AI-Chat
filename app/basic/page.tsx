"use client";

import { useState } from "react";

export default function BasicExample() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateText = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.text);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error generating response");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent">
            Basic Text Generation
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5 font-medium">
            Notice how you wait for the complete response
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">
              Enter your prompt
            </label>
            <textarea
              className="w-full p-4 text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 resize-none placeholder:text-slate-400 font-normal"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Explain quantum computing in simple terms..."
            />
          </div>

          <button
            onClick={generateText}
            disabled={isLoading || !prompt.trim()}
            className="w-full px-6 py-3.5 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-md shadow-rose-500/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Text</span>
            )}
          </button>

          {/* AI Response Section */}
          {response && (
            <div className="mt-8 pt-6 border-t border-slate-100 animate-fadeIn">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                AI Response
              </label>
              <div className="p-5 bg-slate-50/80 border border-slate-100 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner font-normal text-sm sm:text-base">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
