import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { MeetingDetail } from "@/lib/types";

interface EditMeetingModalProps {
  isOpen: boolean;
  meeting: MeetingDetail;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMeetingModal({ isOpen, meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.date.split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(meeting.title);
    setDate(meeting.date.split("T")[0]);
  }, [meeting]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    try {
      setLoading(true);
      await api.updateMeeting(meeting.id, {
        title,
        date: new Date(date).toISOString()
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update meeting", error);
      alert("Failed to update meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Meeting Details</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Meeting Title</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Date</label>
            <input 
              type="date" 
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !title}
              className="px-4 py-2 text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
