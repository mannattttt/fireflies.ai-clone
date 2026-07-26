"use client";

import { MagnifyingGlassIcon, BellIcon, MicrophoneIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { PlusIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { TranscriptSearchResult } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TranscriptSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const results = await api.globalSearch(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-[#6c5ce7]/20 text-[#6c5ce7] px-0.5 rounded">{part}</mark>
            : part
        )}
      </>
    );
  };

  const handleResultClick = (result: TranscriptSearchResult) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/meetings/${result.meeting_id}?t=${result.start_time}`);
  };

  return (
    <nav className="h-14 bg-white dark:bg-[#16162a] border-b border-gray-200 dark:border-[#2a2a4a] flex items-center justify-between px-6 sticky top-0 z-40 shrink-0 transition-colors">
      {/* Left: Page Title */}

      {/* Center: Search */}
      <div className="flex-1 max-w-lg" ref={searchRef}>
        <div className="relative group">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or keyword"
            className="w-full bg-gray-50 dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] text-gray-900 dark:text-gray-100 rounded-lg pl-9 pr-12 py-1.5 text-sm focus:bg-white dark:focus:bg-[#262646] focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 3 && setShowDropdown(true)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#2a2a4a] px-1.5 py-0.5 rounded font-mono">⌘K</span>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a30] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a2a4a] max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin" />
                  Searching transcripts...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Transcript Results
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.segment_id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#262646] transition-colors border-b border-gray-50 dark:border-[#2a2a4a] last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{result.speaker_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a4a] px-1.5 py-0.5 rounded">
                          Meeting #{result.meeting_id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {highlightText(result.text, searchQuery)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No matches found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dark / Light Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a4a] rounded-lg transition-colors"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <SunIcon className="w-4 h-4 text-amber-400" />
          ) : (
            <MoonIcon className="w-4 h-4" />
          )}
        </button>

        {/* Mic */}
        <button className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a4a] rounded-lg transition-colors">
          <MicrophoneIcon className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a4a] rounded-lg transition-colors relative">
          <BellIcon className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <button className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white font-semibold text-xs flex items-center justify-center">
          M
        </button>
      </div>
    </nav>
  );
}
