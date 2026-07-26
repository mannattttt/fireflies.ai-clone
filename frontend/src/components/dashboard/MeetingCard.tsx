import Link from "next/link";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ClockIcon, CalendarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { MeetingListItem } from "@/lib/types";

interface MeetingCardProps {
  meeting: MeetingListItem;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const duration = intervalToDuration({ start: 0, end: meeting.duration_seconds * 1000 });
  const formattedDuration = `${duration.minutes || 0}m ${duration.seconds || 0}s`;

  return (
    <Link href={`/meetings/${meeting.id}`} className="block group">
      <div className="bg-card-bg border border-gray-200 rounded-xl p-5 hover:border-brand-primary/50 hover:shadow-md hover:shadow-brand-primary/5 transition-all h-full flex flex-col relative overflow-hidden">
        
        {/* Subtle decorative top border on hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
            {meeting.title}
          </h3>
          {meeting.has_summary && (
            <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              AI Summary
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{format(new Date(meeting.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formattedDuration}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            {meeting.participants.slice(0, 3).map((p, i) => (
              <div 
                key={p.id} 
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 bg-gradient-to-br from-gray-100 to-gray-300"
                title={p.name}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {meeting.participants.length > 3 && (
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-500">
                +{meeting.participants.length - 3}
              </div>
            )}
          </div>
          
          {meeting.action_item_count > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              {meeting.action_item_count} tasks
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
