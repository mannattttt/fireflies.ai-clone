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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-text-primary">Add New Meeting</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-text-secondary block">Meeting Title</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                placeholder="e.g., Q4 Planning Sync"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary block">Date</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-secondary block">Meeting Transcript</label>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 hover:border-brand-primary cursor-pointer transition-colors group">
                <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 group-hover:text-brand-primary mb-2" />
                <span className="text-sm font-medium text-text-secondary group-hover:text-brand-primary">Upload File</span>
                <span className="text-xs text-text-tertiary mt-1">.txt, .json, .vtt</span>
                <input type="file" accept=".txt,.json,.vtt" className="hidden" onChange={handleFileUpload} />
              </label>
              
              <div className="flex items-center justify-center text-text-tertiary font-medium">OR</div>
              
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 hover:border-brand-primary transition-colors group cursor-pointer" onClick={() => document.getElementById("transcript-textarea")?.focus()}>
                <DocumentTextIcon className="w-8 h-8 text-gray-400 group-hover:text-brand-primary mb-2" />
                <span className="text-sm font-medium text-text-secondary group-hover:text-brand-primary">Paste Text</span>
                <span className="text-xs text-text-tertiary mt-1">Paste transcript below</span>
              </div>
            </div>
            
            {fileName && (
              <div className="bg-brand-primary/5 text-brand-primary text-sm px-3 py-2 rounded-md font-medium border border-brand-primary/20 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                File loaded: {fileName}
              </div>
            )}
            
            <textarea 
              id="transcript-textarea"
              required
              placeholder="Speaker A: Hello everyone...\nSpeaker B: Hi, let's get started..."
              className="w-full border border-gray-200 rounded-lg p-4 h-48 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all font-mono text-sm resize-none"
              value={transcriptText}
              onChange={e => setTranscriptText(e.target.value)}
            />
            <p className="text-xs text-text-tertiary">
              For best results, use "Speaker: Text" format on each line.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-auto">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium text-text-secondary hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !title || !transcriptText}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-brand-primary hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
