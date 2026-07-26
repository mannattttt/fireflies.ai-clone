"use client";

import { ReactNode } from "react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  features?: string[];
}

export default function ComingSoonPage({ title, description, icon, features }: ComingSoonPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#121220] transition-colors">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 flex items-center justify-center mx-auto mb-6 text-[#6c5ce7] dark:text-purple-300">
          {icon}
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{description}</p>

        {features && features.length > 0 && (
          <div className="bg-gray-50 dark:bg-[#1a1a30] border border-gray-100 dark:border-[#2a2a4a] rounded-xl p-5 text-left mb-8">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Planned Features</p>
            <ul className="space-y-2.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] dark:text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
