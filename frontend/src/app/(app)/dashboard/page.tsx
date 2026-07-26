"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, intervalToDuration } from "date-fns";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  AdjustmentsHorizontalIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import NewMeetingModal from "@/components/dashboard/NewMeetingModal";
import { api } from "@/lib/api";
import { MeetingListItem } from "@/lib/types";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Meetings");

  useEffect(() => {
    fetchMeetings();
  }, [searchQuery]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getMeetings(searchQuery || undefined);
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ["All Meetings", "My Meetings", "Shared with Me"];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex flex-col gap-6 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notebook</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Add Meeting
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg w-full sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search meetings..." 
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/50 text-sm outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center p-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-gray-50/30">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white border border-gray-100 rounded-lg w-full" />
              ))}
            </div>
          </div>
        ) : meetings.length > 0 ? (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 sticky top-0 border-b border-gray-200 z-0">
              <tr>
                <th scope="col" className="px-8 py-3 font-medium">Title</th>
                <th scope="col" className="px-6 py-3 font-medium">Date</th>
                <th scope="col" className="px-6 py-3 font-medium">Duration</th>
                <th scope="col" className="px-6 py-3 font-medium">Participants</th>
                <th scope="col" className="px-8 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {meetings.map((meeting) => {
                const duration = intervalToDuration({ start: 0, end: meeting.duration_seconds * 1000 });
                const formattedDuration = `${duration.minutes || 0}m ${duration.seconds || 0}s`;
                
                return (
                  <tr key={meeting.id} className="bg-white hover:bg-gray-50/80 transition-colors group cursor-pointer" onClick={() => window.location.href = `/meetings/${meeting.id}`}>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                          <VideoCameraIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                          {meeting.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(meeting.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formattedDuration}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {meeting.participants.slice(0, 3).map((p) => (
                          <div 
                            key={p.id} 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-300"
                            title={p.name}
                          >
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {meeting.participants.length > 3 && (
                          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-[10px] font-medium text-gray-500">
                            +{meeting.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      {meeting.has_summary ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                          Summarized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Processing
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No meetings found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms." : "You haven't recorded any meetings yet."}
            </p>
          </div>
        )}
      </div>
      
      <NewMeetingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMeetings} 
      />
    </div>
  );
}
