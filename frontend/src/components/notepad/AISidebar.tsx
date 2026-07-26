import { useState } from "react";
import { MeetingDetail } from "@/lib/types";
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  HashtagIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { api } from "@/lib/api";

interface AISidebarProps {
  meeting: MeetingDetail;
  onTopicClick?: (topic: string) => void;
}

export default function AISidebar({ meeting, onTopicClick }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "tasks" | "topics">("summary");
  const [actionItems, setActionItems] = useState(meeting.action_items);
  const summary = meeting.summary;

  const handleToggleTask = async (id: number) => {
    try {
      // Optimistic update
      setActionItems(items => 
        items.map(item => item.id === id ? { ...item, is_completed: !item.is_completed } : item)
      );
      // API call
      await api.toggleActionItem(id);
    } catch (error) {
      console.error("Failed to toggle action item", error);
      // Revert on failure (simple reload here)
      const freshMeeting = await api.getMeeting(meeting.id);
      setActionItems(freshMeeting.action_items);
    }
  };

  const tabs = [
    { id: "summary", label: "AskFred / AI", icon: SparklesIcon },
    { id: "tasks", label: `Tasks (${actionItems.filter(i => !i.is_completed).length})`, icon: CheckCircleIcon },
    { id: "topics", label: "Outline", icon: HashtagIcon }
  ] as const;

  if (!summary) {
    return (
      <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200 p-6 items-center justify-center text-center">
        <SparklesIcon className="w-10 h-10 text-gray-300 mb-4" />
        <h3 className="text-gray-900 font-medium mb-1">AI Processing</h3>
        <p className="text-gray-500 text-sm">The AI is currently analyzing this meeting. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 bg-gray-100 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 text-xs font-medium rounded-md transition-all ${
              activeTab === tab.id 
                ? "bg-white text-brand-primary shadow-sm ring-1 ring-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        
        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* AskFred Mock Input */}
            <div className="relative">
              <SparklesIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary" />
              <input 
                type="text" 
                placeholder="Ask AskFred anything..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                Meeting Summary
              </h3>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-700 leading-relaxed space-y-3">
                {summary.overview_text.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">Talk Ratio</div>
                  <div className="font-semibold text-gray-900">54% / 46%</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">Questions</div>
                  <div className="font-semibold text-gray-900">12 asked</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Action Items
            </h3>
            
            {actionItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No action items detected.</p>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleToggleTask(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      item.is_completed 
                        ? "bg-gray-50 border-transparent opacity-60" 
                        : "bg-white border-gray-200 shadow-sm hover:border-brand-primary/50"
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 transition-colors">
                      {item.is_completed ? (
                        <CheckCircleSolidIcon className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-brand-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${item.is_completed ? "text-gray-500 line-through" : "text-gray-800"}`}>
                        {item.text}
                      </p>
                      {item.assignee && (
                        <span className="inline-block mt-2 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          @{item.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOPICS / OUTLINE TAB */}
        {activeTab === "topics" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Smart Outline
            </h3>
            
            {meeting.key_topics.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No topics detected.</p>
            ) : (
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-4">
                {meeting.key_topics.map((topic, i) => (
                  <div key={i} className="relative pl-6 group cursor-pointer" onClick={() => onTopicClick?.(topic.topic_text)}>
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-brand-primary transition-colors ring-4 ring-gray-50"></div>
                    
                    <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm group-hover:shadow-md transition-all group-hover:border-brand-primary/30">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 flex justify-between items-center">
                        {topic.topic_text}
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
