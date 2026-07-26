"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { MeetingDetail } from "@/lib/types";

import MediaPlayer from "@/components/notepad/MediaPlayer";
import TranscriptPanel from "@/components/notepad/TranscriptPanel";
import AISidebar from "@/components/notepad/AISidebar";
import EditMeetingModal from "@/components/dashboard/EditMeetingModal";
import { useToast } from "@/components/ui/ToastProvider";

import { 
  exportSummaryAsMarkdown, 
  exportTranscriptAsText, 
  exportTranscriptAsVTT,
  exportSummaryAsPDF
} from "@/lib/exportUtils";
import { 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  PrinterIcon 
} from "@heroicons/react/24/outline";

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the Promise in Next.js 15+
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const startTime = searchParams.get('t');

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { addToast } = useToast();

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime ? parseFloat(startTime) : 0);

  useEffect(() => {
    fetchMeeting();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (startTime && !isPlaying) {
      setCurrentTime(parseFloat(startTime));
      setIsPlaying(true);
    }
  }, [startTime]);

  // Mock player timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && meeting && currentTime < meeting.duration_seconds) {
      interval = setInterval(() => {
        setCurrentTime(t => Math.min(t + 1, meeting.duration_seconds));
      }, 1000);
    } else if (meeting && currentTime >= meeting.duration_seconds) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, meeting]);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const data = await api.getMeeting(parseInt(resolvedParams.id));
      setMeeting(data);
    } catch (error) {
      console.error("Failed to fetch meeting detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meeting) return;
    if (window.confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
      try {
        await api.deleteMeeting(meeting.id);
        addToast(`"${meeting.title}" has been deleted.`, "success");
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to delete meeting", error);
        addToast("Failed to delete meeting.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading Notepad...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Not Found</h2>
        <Link href="/dashboard" className="text-brand-primary hover:underline">
          Return to Notebook
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">{meeting.title}</h1>
            <span className="text-xs text-gray-500">{new Date(meeting.date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg transition-colors border border-brand-primary/20"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>

            {/* Export Options Popover */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    exportSummaryAsMarkdown(meeting);
                    addToast("Summary downloaded as Markdown (.md)", "success");
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-primary rounded-lg transition-colors text-left"
                >
                  <DocumentTextIcon className="w-4 h-4 text-brand-primary" />
                  <span>Export Summary (.md)</span>
                </button>
                
                <button
                  onClick={() => {
                    exportTranscriptAsText(meeting);
                    addToast("Transcript downloaded as Text (.txt)", "success");
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-primary rounded-lg transition-colors text-left"
                >
                  <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                  <span>Export Transcript (.txt)</span>
                </button>

                <button
                  onClick={() => {
                    exportTranscriptAsVTT(meeting);
                    addToast("Subtitles downloaded (.vtt)", "success");
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-primary rounded-lg transition-colors text-left"
                >
                  <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                  <span>Export Subtitles (.vtt)</span>
                </button>

                <hr className="my-1 border-gray-100" />

                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    exportSummaryAsPDF(meeting);
                    addToast("PDF Summary report ready for printing/saving", "success");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-primary rounded-lg transition-colors text-left"
                >
                  <PrinterIcon className="w-4 h-4 text-gray-400" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDeleteMeeting}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </header>

      {/* Main Content: 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left & Center: Player & Transcript */}
        <div className="flex-1 flex flex-col h-full p-4 gap-4 overflow-hidden">

          <div className="w-full max-w-4xl mx-auto shrink-0">
            <MediaPlayer
              durationSeconds={meeting.duration_seconds}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onSeek={(time) => setCurrentTime(time)}
            />
          </div>

          <div className="flex-1 w-full max-w-4xl mx-auto overflow-hidden">
            <TranscriptPanel
              segments={meeting.transcript_segments}
              currentTime={currentTime}
              onSegmentClick={(time) => {
                setCurrentTime(time);
                setIsPlaying(true);
              }}
            />
          </div>

        </div>

        {/* Right Sidebar: AI Summary */}
        <div className="w-[400px] shrink-0 border-l border-gray-200 hidden lg:block bg-white z-0">
          <AISidebar meeting={meeting} />
        </div>

      </div>

      <EditMeetingModal
        isOpen={isEditModalOpen}
        meeting={meeting}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchMeeting}
      />
    </div>
  );
}
