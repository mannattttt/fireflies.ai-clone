import { useEffect, useRef, useState } from "react";
import { TranscriptSegment } from "@/lib/types";
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  ChatBubbleLeftEllipsisIcon, 
  ShareIcon 
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/ui/ToastProvider";

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSegmentClick: (startTime: number) => void;
  searchQuery?: string;
}

export default function TranscriptPanel({ 
  segments, 
  currentTime, 
  onSegmentClick,
  searchQuery = ""
}: TranscriptPanelProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;
      
      // Only scroll if element is outside visible area
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime]);

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Group consecutive segments by same speaker
  const groupedSegments: TranscriptSegment[][] = [];
  let currentGroup: TranscriptSegment[] = [];

  segments.forEach((seg, index) => {
    if (index === 0) {
      currentGroup.push(seg);
    } else {
      const prev = segments[index - 1];
      if (prev.speaker_name === seg.speaker_name && (seg.start_time - prev.end_time) < 5) {
        currentGroup.push(seg);
      } else {
        groupedSegments.push([...currentGroup]);
        currentGroup = [seg];
      }
    }
  });
  if (currentGroup.length > 0) {
    groupedSegments.push(currentGroup);
  }

  // Helper to highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 text-black px-1 rounded">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const activeSearch = localSearch || searchQuery;
  const { addToast } = useToast();

  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<number, string[]>>({});
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const toggleHighlight = (segId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyHighlighted = highlightedIds.has(segId);

    setHighlightedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyHighlighted) {
        next.delete(segId);
      } else {
        next.add(segId);
      }
      return next;
    });

    if (isCurrentlyHighlighted) {
      addToast("Highlight removed", "info");
    } else {
      addToast("Transcript line highlighted", "success");
    }
  };

  const handleAddComment = (segId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsMap(prev => ({
      ...prev,
      [segId]: [...(prev[segId] || []), commentInput.trim()]
    }));
    setCommentInput("");
    setActiveCommentId(null);
    addToast("Comment added to transcript line", "success");
  };

  const handleCopySoundbite = (startTime: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?t=${startTime}`;
    navigator.clipboard.writeText(url);
    addToast(`Soundbite link copied to clipboard! (Timestamp ${formatTimestamp(startTime)})`, "success");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 gap-4">
        <h2 className="font-semibold text-gray-900 text-sm shrink-0">Thread</h2>
        
        {/* Inline Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transcript..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1 text-xs focus:bg-white focus:border-brand-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
            {segments.length} segments
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
            <MagnifyingGlassIcon className="w-8 h-8" />
            <p>No transcript available</p>
          </div>
        ) : (
          groupedSegments.map((group, groupIdx) => (
            <div key={groupIdx} className="flex gap-4 group/thread">
              {/* Speaker Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0 border border-brand-primary/10">
                {group[0].speaker_name.charAt(0).toUpperCase()}
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {group[0].speaker_name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {formatTimestamp(group[0].start_time)}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.map((seg) => {
                    const isActive = currentTime >= seg.start_time && currentTime <= seg.end_time;
                    const isHighlighted = highlightedIds.has(seg.id);
                    const segComments = commentsMap[seg.id] || [];
                    
                    return (
                      <div 
                        key={seg.id}
                        ref={isActive ? activeSegmentRef : null}
                        onClick={() => onSegmentClick(seg.start_time)}
                        className={`text-sm leading-relaxed p-2.5 -mx-2 rounded-xl cursor-pointer transition-all relative group/seg ${
                          isHighlighted
                            ? "bg-amber-50/80 border-l-4 border-amber-400 pl-3"
                            : isActive 
                            ? "bg-brand-primary/5 border-l-4 border-brand-primary pl-3 shadow-xs" 
                            : "hover:bg-gray-50/80 text-gray-700 border-l-4 border-transparent pl-3"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            {highlightText(seg.text, activeSearch)}
                          </div>

                          {/* Hover Action Bar */}
                          <div className="opacity-0 group-hover/seg:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-lg p-0.5 shrink-0">
                            {/* Bookmark / Highlight */}
                            <button
                              onClick={(e) => toggleHighlight(seg.id, e)}
                              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                                isHighlighted ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
                              }`}
                              title={isHighlighted ? "Remove highlight" : "Highlight line"}
                            >
                              {isHighlighted ? (
                                <BookmarkSolidIcon className="w-3.5 h-3.5" />
                              ) : (
                                <BookmarkIcon className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Comment */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCommentId(activeCommentId === seg.id ? null : seg.id);
                              }}
                              className="p-1 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded transition-colors"
                              title="Add comment"
                            >
                              <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
                            </button>

                            {/* Share Soundbite */}
                            <button
                              onClick={(e) => handleCopySoundbite(seg.start_time, e)}
                              className="p-1 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded transition-colors"
                              title="Copy soundbite link"
                            >
                              <ShareIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Existing Comments List */}
                        {segComments.length > 0 && (
                          <div className="mt-2 space-y-1 pt-1 border-t border-amber-200/50">
                            {segComments.map((c, i) => (
                              <div key={i} className="text-xs bg-amber-100/70 text-amber-900 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                                <span className="font-semibold text-amber-700">Note:</span>
                                {c}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Comment Form */}
                        {activeCommentId === seg.id && (
                          <form
                            onSubmit={(e) => handleAddComment(seg.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 flex gap-2 pt-1"
                          >
                            <input
                              type="text"
                              placeholder="Type a note or comment..."
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              autoFocus
                              className="flex-1 px-3 py-1.5 bg-white border border-brand-primary/30 rounded-lg text-xs outline-none focus:border-brand-primary"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors"
                            >
                              Save Note
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
