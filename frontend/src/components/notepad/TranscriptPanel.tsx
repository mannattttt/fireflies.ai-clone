import { useEffect, useRef } from "react";
import { TranscriptSegment } from "@/lib/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="font-semibold text-gray-900">Thread</h2>
        <div className="flex items-center gap-4">
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
                    
                    return (
                      <div 
                        key={seg.id}
                        ref={isActive ? activeSegmentRef : null}
                        onClick={() => onSegmentClick(seg.start_time)}
                        className={`text-sm leading-relaxed p-2 -mx-2 rounded-lg cursor-pointer transition-colors ${
                          isActive 
                            ? "bg-brand-primary/5 border-l-2 border-brand-primary pl-1.5" 
                            : "hover:bg-gray-50 text-gray-700 border-l-2 border-transparent pl-1.5"
                        }`}
                      >
                        {highlightText(seg.text, searchQuery)}
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
