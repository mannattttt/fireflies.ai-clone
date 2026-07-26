"use client";

import { useEffect, useState } from "react";
import { format, intervalToDuration } from "date-fns";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  HashtagIcon,
  FolderIcon,
  VideoCameraIcon,
  SparklesIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import NewMeetingModal from "@/components/dashboard/NewMeetingModal";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";
import { getTagForMeeting, PRESET_TAGS } from "@/lib/tagUtils";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Hosted by me");
  const [activeChannel, setActiveChannel] = useState("My Meetings");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const { addToast } = useToast();

  // AskFred Dashboard State
  const [fredInput, setFredInput] = useState("");
  const [fredMessages, setFredMessages] = useState<{ id: string; text: string; sender: "user" | "fred" }[]>([]);
  const [isFredLoading, setIsFredLoading] = useState(false);

  const handleAskFredDashboard = async (questionText?: string) => {
    const q = questionText || fredInput;
    if (!q.trim() || isFredLoading) return;

    const userMsg = { id: Date.now().toString(), text: q, sender: "user" as const };
    setFredMessages(prev => [...prev, userMsg]);
    if (!questionText) setFredInput("");
    setIsFredLoading(true);

    try {
      if (meetings.length === 0) {
        setFredMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "No meetings found in your library yet! Upload or record a meeting to start asking Fred.",
          sender: "fred"
        }]);
      } else {
        // Query Gemini AskFred API using the latest meeting ID
        const targetMeeting = meetings[0];
        const answerText = await api.askFred(targetMeeting.id, q);
        setFredMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: answerText,
          sender: "fred"
        }]);
      }
    } catch (err) {
      console.error("AskFred failed", err);
      setFredMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I ran into an issue retrieving insights for this question. Please try again.",
        sender: "fred"
      }]);
    } finally {
      setIsFredLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [searchQuery, sortOrder, dateFrom, dateTo]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getMeetings(
        searchQuery || undefined,
        dateFrom || undefined,
        dateTo || undefined,
        sortOrder
      );
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ["Hosted by me", "Shared with me"];
  const channels = [
    { name: "My Meetings", icon: HashtagIcon, active: true },
    { name: "All Meetings", icon: FolderIcon, active: false },
    { name: "Voice Agent Meetings", icon: VideoCameraIcon, active: false },
  ];

  return (
    <div className="flex h-full bg-white dark:bg-[#121220] text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* ── Left Panel: Channels ── */}
      <div className="w-[220px] shrink-0 border-r border-gray-200 dark:border-[#2a2a4a] hidden md:flex flex-col bg-white dark:bg-[#16162a]">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Meetings</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-[#6c5ce7] hover:bg-[#6c5ce7]/10 rounded-md transition-colors"
            title="Add New Meeting"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pb-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 bg-[#6c5ce7] hover:bg-[#5a4bd4] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Meeting
          </button>
        </div>

        {/* Channel List */}
        <div className="flex-1 px-2 space-y-0.5">
          {channels.map((ch) => (
            <button
              key={ch.name}
              onClick={() => setActiveChannel(ch.name)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeChannel === ch.name
                  ? "bg-[#6c5ce7]/5 text-[#6c5ce7] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {activeChannel === ch.name ? (
                <span className="text-[#6c5ce7] text-xs font-bold">#</span>
              ) : (
                <ch.icon className="w-4 h-4 text-gray-400" />
              )}
              {ch.name}
            </button>
          ))}

          <div className="pt-4 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">All channels</p>
            <p className="text-[#6c5ce7] text-xs font-medium mb-1">#</p>
            <p className="text-xs text-gray-500">Create channels to organize your conversations</p>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg w-full mt-2">
            <PlusIcon className="w-4 h-4" />
            Channel
          </button>
        </div>
      </div>
      {/* ── Center Panel: Meeting List ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#121220]">
        {/* Tabs & Filters Header Row */}
        <div className="px-6 pt-3 pb-3 flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-[#2a2a4a] gap-3 relative">
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-gray-100 dark:bg-[#202038] text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a1a30]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-48 sm:w-56">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Search title or participant..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] text-gray-900 dark:text-gray-100 rounded-lg text-xs outline-none focus:bg-white dark:focus:bg-[#262646] focus:border-[#6c5ce7] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Recency Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as "desc" | "asc")}
              className="bg-white dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] text-gray-700 dark:text-gray-200 text-xs rounded-lg px-2 py-1 outline-none font-medium cursor-pointer focus:border-[#6c5ce7]"
            >
              <option value="desc">Sort: Most Recent</option>
              <option value="asc">Sort: Oldest First</option>
            </select>

            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                showFilterMenu || dateFrom || dateTo
                  ? "border-[#6c5ce7] text-[#6c5ce7] bg-[#6c5ce7]/5"
                  : "border-gray-200 dark:border-[#2a2a4a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#202038]"
              }`}
            >
              Filters
              {(dateFrom || dateTo) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7]" />
              )}
            </button>

            {/* Date Filter Dropdown Popover */}
            {showFilterMenu && (
              <div className="absolute right-6 top-full mt-2 w-72 bg-white dark:bg-[#1a1a30] border border-gray-200 dark:border-[#2a2a4a] rounded-xl shadow-xl p-4 z-50 space-y-3">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Filter by Date Range</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">From Date</label>
                    <input 
                      type="date" 
                      value={dateFrom} 
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full border border-gray-200 dark:border-[#2a2a4a] bg-white dark:bg-[#202038] text-gray-900 dark:text-gray-100 rounded-md px-2 py-1 text-xs outline-none focus:border-[#6c5ce7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">To Date</label>
                    <input 
                      type="date" 
                      value={dateTo} 
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full border border-gray-200 dark:border-[#2a2a4a] bg-white dark:bg-[#202038] text-gray-900 dark:text-gray-100 rounded-md px-2 py-1 text-xs outline-none focus:border-[#6c5ce7]"
                    />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <button 
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
                  >
                    Clear Date Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meeting List */}
        <div className="flex-1 overflow-y-auto">
          {/* Category Tag Filter Pills */}
          <div className="px-6 py-2 bg-gray-50/60 dark:bg-[#16162a] border-b border-gray-100 dark:border-[#2a2a4a] flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 shrink-0">Tags:</span>
            {["All", ...Object.keys(PRESET_TAGS)].map((tagName) => {
              const isActive = selectedTag === tagName;
              return (
                <button
                  key={tagName}
                  onClick={() => setSelectedTag(tagName)}
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all shrink-0 ${
                    isActive
                      ? "bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-xs"
                      : "bg-white dark:bg-[#202038] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#2a2a4a] hover:bg-gray-100 dark:hover:bg-[#262646]"
                  }`}
                >
                  {tagName === "All" ? "All Tags" : `#${tagName}`}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-2 bg-gray-50 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (() => {
            const filteredMeetings = selectedTag === "All" 
              ? meetings 
              : meetings.filter(m => getTagForMeeting(m.title).name === selectedTag);

            return filteredMeetings.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-[#2a2a4a]">
                {filteredMeetings.map((meeting) => {
                  const duration = intervalToDuration({ start: 0, end: meeting.duration_seconds * 1000 });
                  const formattedDuration = `${duration.minutes || 0}m ${duration.seconds || 0}s`;
                  const tag = getTagForMeeting(meeting.title);

                  return (
                    <a
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/80 dark:hover:bg-[#1a1a30] transition-colors group cursor-pointer"
                    >
                      {/* Fireflies Logo Icon */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7]/20 to-[#a855f7]/20 flex items-center justify-center text-[#6c5ce7] shrink-0">
                        <VideoCameraIcon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#6c5ce7] transition-colors truncate">
                            {meeting.title}
                          </p>
                          <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border ${tag.bg} ${tag.color} ${tag.border} shrink-0`}>
                            #{tag.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(meeting.date), "EEE, MMM d yyyy, h:mm a")} · {formattedDuration}
                        </p>
                      </div>

                    {/* Status Badge */}
                    {meeting.has_summary ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                        <CheckCircleIcon className="w-3 h-3" />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Processing
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          ) : (
            /* Empty State — matches Fireflies */
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-8">
              {/* Skeleton preview cards */}
              <div className="space-y-3 mb-8 w-full max-w-xs">
                {["K", "A", "R"].map((letter, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                      {letter}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-gray-200 rounded w-3/4" />
                      <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-1 text-center">
                Looks like you haven&apos;t recorded a meeting yet
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                Once you record your first meeting with Fireflies, it&apos;ll show up right here.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#6c5ce7] hover:bg-[#5a4bd4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Capture
              </button>
            </div>
          );
        })()}
        </div>
      </div>

      {/* ── Right Panel: Ask Fred ── */}
      <div className="w-[300px] shrink-0 border-l border-gray-200 dark:border-[#2a2a4a] bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-100 flex flex-col hidden xl:flex">
        {/* Fred Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-[#202038] flex items-center justify-center">
              <SparklesIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Ask Fred</span>
          </div>
          {fredMessages.length > 0 && (
            <button
              onClick={() => setFredMessages([])}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Greeting & Chat Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="text-center py-2">
            <div className="flex justify-center mb-2">
              <SparklesIcon className="w-7 h-7 text-[#6c5ce7]" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Hi Mannat!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything about your meetings</p>
          </div>

          {/* Chat Messages */}
          {fredMessages.length > 0 && (
            <div className="space-y-2.5 pt-2">
              {fredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`text-xs p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#6c5ce7] text-white ml-auto rounded-br-none"
                      : "bg-gray-100 dark:bg-[#202038] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[#2a2a4a] rounded-bl-none shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isFredLoading && (
                <div className="bg-gray-100 dark:bg-[#202038] text-gray-500 dark:text-gray-400 text-xs p-2.5 rounded-xl rounded-bl-none flex items-center gap-2 w-max border border-gray-200 dark:border-[#2a2a4a]">
                  <div className="w-3 h-3 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin" />
                  AskFred is analyzing...
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {fredMessages.length === 0 && (
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => handleAskFredDashboard("List my action items & todos from recent meetings")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left bg-gray-50 dark:bg-[#202038] hover:bg-gray-100 dark:hover:bg-[#262646] transition-colors border border-gray-100 dark:border-[#2a2a4a]"
              >
                <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-200">List my action items & todos</span>
              </button>
              <button 
                onClick={() => handleAskFredDashboard("Summarize key decisions made across my meetings")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left bg-gray-50 dark:bg-[#202038] hover:bg-gray-100 dark:hover:bg-[#262646] transition-colors border border-gray-100 dark:border-[#2a2a4a]"
              >
                <span className="text-sm shrink-0">🎯</span>
                <span className="text-gray-700 dark:text-gray-200">Key decisions</span>
              </button>
              <button 
                onClick={() => handleAskFredDashboard("What are the key product & technical initiatives mentioned?")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left bg-gray-50 dark:bg-[#202038] hover:bg-gray-100 dark:hover:bg-[#262646] transition-colors border border-gray-100 dark:border-[#2a2a4a]"
              >
                <RocketLaunchIcon className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-200">Key initiatives</span>
              </button>
            </div>
          )}
        </div>

        {/* AskFred Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskFredDashboard();
          }}
          className="p-3 border-t border-gray-100 dark:border-[#2a2a4a] space-y-2"
        >
          <div className="flex items-center justify-between px-2.5 py-1 bg-gray-50 dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] rounded-md text-[10px] text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-[#6c5ce7]"># All Meetings</span>
            <span>Gemini 3.5</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] rounded-lg">
            <input 
              type="text" 
              placeholder="Ask anything about your meetings..." 
              value={fredInput}
              onChange={(e) => setFredInput(e.target.value)}
              disabled={isFredLoading}
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!fredInput.trim() || isFredLoading}
              className="p-1 bg-[#6c5ce7] hover:bg-[#5a4bd4] text-white rounded transition-colors disabled:opacity-40"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      <NewMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchMeetings();
          addToast("Meeting created successfully!", "success");
        }}
      />
    </div>
  );
}
