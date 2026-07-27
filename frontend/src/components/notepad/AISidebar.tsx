import { useState } from "react";
import { MeetingDetail } from "@/lib/types";
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  HashtagIcon,
  ChevronRightIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { api } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "fred";
  text: string;
}

const presetQuestions = [
  "What were the main takeaways?",
  "Who spoke the most during this call?",
  "List all action items mentioned.",
  "What were the key decisions made?"
];

interface AISidebarProps {
  meeting: MeetingDetail;
  onTopicClick?: (topic: string) => void;
  onMeetingUpdate?: (updated: MeetingDetail) => void;
}

export default function AISidebar({ meeting, onTopicClick, onMeetingUpdate }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "tasks" | "topics">("summary");
  const [actionItems, setActionItems] = useState(meeting.action_items);
  const [newTaskText, setNewTaskText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAskingFred, setIsAskingFred] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const summary = meeting.summary;

  const handleRegenerateSummary = async () => {
    setIsRegenerating(true);
    try {
      const updated = await api.regenerateSummary(meeting.id);
      if (onMeetingUpdate) onMeetingUpdate(updated);
    } catch (err) {
      console.error("Failed to regenerate summary:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAskFred = async (questionText?: string) => {
    const q = (questionText || chatInput).trim();
    if (!q || isAskingFred) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: q };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAskingFred(true);

    try {
      const answer = await api.askFred(meeting.id, q);
      const fredMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "fred", text: answer };
      setChatMessages(prev => [...prev, fredMsg]);
    } catch (err) {
      console.error("AskFred chat failed:", err);
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: "fred", 
        text: "Sorry, I couldn't process your question. Please ensure your Gemini API key is configured correctly." 
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAskingFred(false);
    }
  };

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

  // Dynamically compute Quick Stats from transcript segments
  const computeQuickStats = () => {
    const segments = meeting.transcript_segments || [];
    
    // Count questions
    const questionCount = segments.filter(s => s.text.includes("?")).length;

    // Calculate talk ratio between top speakers
    const speakerWords: Record<string, number> = {};
    let totalWords = 0;

    segments.forEach(s => {
      const words = s.text.trim().split(/\s+/).length;
      speakerWords[s.speaker_name] = (speakerWords[s.speaker_name] || 0) + words;
      totalWords += words;
    });

    const speakers = Object.keys(speakerWords).sort((a, b) => speakerWords[b] - speakerWords[a]);

    let talkRatioStr = "100%";
    if (totalWords > 0 && speakers.length >= 2) {
      const p1 = Math.round((speakerWords[speakers[0]] / totalWords) * 100);
      const p2 = 100 - p1;
      talkRatioStr = `${p1}% / ${p2}%`;
    }

    return { talkRatioStr, questionCount };
  };

  const { talkRatioStr, questionCount } = computeQuickStats();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#16162a] border-l border-gray-200 dark:border-[#2a2a4a] text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-[#2a2a4a] bg-gray-50/50 dark:bg-[#1a1a30] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-[#262646] text-brand-primary dark:text-purple-300 shadow-sm font-semibold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-[#202038]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        
        {/* SUMMARY & ASK FRED TAB */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* AskFred Interactive Q&A Box */}
            <div className="bg-brand-primary/5 dark:bg-[#1a1a30] border border-brand-primary/20 dark:border-[#2a2a4a] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-brand-primary dark:text-purple-400 font-semibold text-xs uppercase tracking-wider">
                <SparklesIcon className="w-4 h-4" />
                AskFred AI Assistant
              </div>

              {/* Chat Message History */}
              {chatMessages.length > 0 && (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-brand-primary text-white ml-auto rounded-br-none"
                          : "bg-white dark:bg-[#202038] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[#2a2a4a] shadow-sm rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {isAskingFred && (
                    <div className="bg-white dark:bg-[#202038] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a4a] shadow-sm text-xs p-2.5 rounded-xl rounded-bl-none flex items-center gap-2 w-max">
                      <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      AskFred is analyzing meeting...
                    </div>
                  )}
                </div>
              )}

              {/* Preset Question Suggestions */}
              {chatMessages.length === 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Suggested questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {presetQuestions.map((pq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskFred(pq)}
                        className="text-[11px] bg-white dark:bg-[#202038] border border-brand-primary/20 dark:border-[#2a2a4a] hover:border-brand-primary text-gray-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-purple-300 px-2.5 py-1 rounded-lg transition-colors text-left"
                      >
                        &ldquo;{pq}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskFred();
                }}
                className="flex gap-2 pt-1"
              >
                <input 
                  type="text" 
                  placeholder="Ask a question about this meeting..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAskingFred}
                  className="flex-1 pl-3 pr-3 py-2 bg-white dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] text-gray-900 dark:text-gray-100 rounded-lg text-xs outline-none focus:border-brand-primary transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAskingFred}
                  className="px-3 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors shrink-0"
                >
                  Ask
                </button>
              </form>
            </div>
            
            {summary ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                    Meeting Summary
                  </h3>
                  <button
                    onClick={handleRegenerateSummary}
                    disabled={isRegenerating}
                    title="Regenerate AI Summary"
                    className="flex items-center gap-1 text-[10px] font-medium text-[#6c5ce7] hover:text-[#5a4bd4] disabled:opacity-50 transition-colors"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
                <div className="bg-white dark:bg-[#1a1a30] p-4 rounded-xl border border-gray-200 dark:border-[#2a2a4a] shadow-sm text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                  {summary.overview_text.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-[#1a1a30] rounded-xl border border-gray-200 dark:border-[#2a2a4a] text-xs text-gray-500 dark:text-gray-400 text-center">
                <p className="mb-2">No summary available for this meeting.</p>
                <button
                  onClick={handleRegenerateSummary}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1 text-[#6c5ce7] hover:text-[#5a4bd4] font-medium disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Generating...' : 'Generate Summary'}
                </button>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#1a1a30] p-3 rounded-lg border border-gray-200 dark:border-[#2a2a4a] text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Talk Ratio</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{talkRatioStr}</div>
                </div>
                <div className="bg-white dark:bg-[#1a1a30] p-3 rounded-lg border border-gray-200 dark:border-[#2a2a4a] text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Questions</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{questionCount} asked</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Action Items
              </h3>
            </div>

            {/* Quick Add Task Input */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTaskText.trim()) return;
                try {
                  const newItem = await api.createActionItem(meeting.id, newTaskText);
                  setActionItems(prev => [...prev, newItem]);
                  setNewTaskText("");
                } catch (err) {
                  console.error("Failed to add action item", err);
                }
              }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                placeholder="Add a new action item..." 
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#202038] border border-gray-200 dark:border-[#2a2a4a] text-gray-900 dark:text-gray-100 rounded-lg outline-none focus:border-brand-primary transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button 
                type="submit" 
                disabled={!newTaskText.trim()}
                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </form>
            
            {actionItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No action items detected.</p>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all group ${
                      item.is_completed 
                        ? "bg-gray-50 dark:bg-[#1a1a30]/50 border-transparent opacity-60" 
                        : "bg-white dark:bg-[#1a1a30] border-gray-200 dark:border-[#2a2a4a] shadow-sm hover:border-brand-primary/50"
                    }`}
                  >
                    <button 
                      onClick={() => handleToggleTask(item.id)} 
                      className="mt-0.5 shrink-0 transition-colors"
                    >
                      {item.is_completed ? (
                        <CheckCircleSolidIcon className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-brand-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={() => handleToggleTask(item.id)}>
                      <p className={`text-sm ${item.is_completed ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-800 dark:text-gray-100"}`}>
                        {item.text}
                      </p>
                      {item.assignee && (
                        <span className="inline-block mt-2 text-xs font-medium bg-gray-100 dark:bg-[#202038] text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          @{item.assignee}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await api.deleteActionItem(item.id);
                          setActionItems(items => items.filter(i => i.id !== item.id));
                        } catch (err) {
                          console.error("Failed to delete task", err);
                        }
                      }}
                      className="text-gray-300 dark:text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Task"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOPICS / OUTLINE TAB */}
        {activeTab === "topics" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
              Smart Outline
            </h3>
            
            {meeting.key_topics.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No topics detected.</p>
            ) : (
              <div className="relative border-l-2 border-gray-200 dark:border-[#2a2a4a] ml-3 space-y-6 pb-4">
                {meeting.key_topics.map((topic, i) => (
                  <div key={i} className="relative pl-6 group cursor-pointer" onClick={() => onTopicClick?.(topic.topic_text)}>
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-brand-primary transition-colors ring-4 ring-gray-50 dark:ring-[#16162a]"></div>
                    
                    <div className="bg-white dark:bg-[#1a1a30] border border-gray-200 dark:border-[#2a2a4a] p-3 rounded-lg shadow-sm group-hover:shadow-md transition-all group-hover:border-brand-primary/30">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 flex justify-between items-center">
                        {topic.topic_text}
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
