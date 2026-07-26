"use client";

import { MagnifyingGlassIcon, BellIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { PlusIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { TranscriptSearchResult } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TranscriptSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left: Page Title placeholder */}
      <div className="w-16 shrink-0" />

      {/* Center: Search */}
      <div className="flex-1 max-w-lg" ref={searchRef}>
        <div className="relative group">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by title or keyword" 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-12 py-1.5 text-sm focus:bg-white focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none transition-all placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 3 && setShowDropdown(true)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">⌘K</span>
          
          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin" />
                  Searching transcripts...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Transcript Results
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.segment_id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{result.speaker_name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          Meeting #{result.meeting_id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {highlightText(result.text, searchQuery)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No matches found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mic */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <MicrophoneIcon className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
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
