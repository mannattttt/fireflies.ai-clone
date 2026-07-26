import { useState } from "react";
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewMeetingModal({ isOpen, onClose, onSuccess }: NewMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [transcriptText, setTranscriptText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTranscriptText(text);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !transcriptText) return;
    
    try {
      setLoading(true);
      
      await api.createMeeting({
        title,
        date: new Date(date).toISOString(),
        duration_seconds: 1800, // Default 30 min if not specified
        participants: [
          { name: "Alex Morgan", email: "alex.morgan@company.com" }
        ],
        transcript_text: transcriptText
      });
      
      onSuccess();
      onClose();
      // Reset form
      setTitle("");
      setTranscriptText("");
      setFileName("");
    } catch (error) {
      console.error("Failed to create meeting", error);
      alert("Failed to create meeting. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-gray-100 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#2a2a4a] transition-colors">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#2a2a4a]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Meeting</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#202038] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Meeting Title</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-200 dark:border-[#2a2a4a] bg-white dark:bg-[#202038] text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="e.g., Q4 Planning Sync"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Date</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-200 dark:border-[#2a2a4a] bg-white dark:bg-[#202038] text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Meeting Transcript</label>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#2a2a4a] rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-[#202038] hover:border-brand-primary cursor-pointer transition-colors group">
                <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-brand-primary mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-primary">Upload File</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">.txt, .json, .vtt</span>
                <input type="file" accept=".txt,.json,.vtt" className="hidden" onChange={handleFileUpload} />
              </label>
              
              <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium">OR</div>
              
              <div className="flex-1 flex flex-col items-center justify-center border border-gray-200 dark:border-[#2a2a4a] bg-gray-50 dark:bg-[#202038] rounded-lg p-6 text-center">
                <DocumentTextIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paste Text Below</span>
              </div>
            </div>
            
            {fileName && (
              <div className="text-xs font-medium text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 p-2.5 rounded-lg flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                Loaded: {fileName}
              </div>
            )}
            
            <textarea 
              rows={5}
              required
              placeholder="Speaker A: Hello team...\nSpeaker B: Thanks for joining today."
              className="w-full border border-gray-200 dark:border-[#2a2a4a] bg-white dark:bg-[#202038] text-gray-900 dark:text-gray-100 rounded-lg p-3 text-xs focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={transcriptText}
              onChange={e => setTranscriptText(e.target.value)}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-[#2a2a4a] flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202038] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !title || !transcriptText}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-brand-primary/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
