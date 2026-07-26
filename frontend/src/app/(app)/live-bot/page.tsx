"use client";

import ComingSoonPage from "@/components/ui/ComingSoonPage";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

export default function LiveBotPage() {
  return (
    <ComingSoonPage
      title="Fred Live Meeting Assistant"
      description="Connect Fireflies to your calendar to automatically have Fred join, record, and transcribe your Google Meet, Zoom, and MS Teams calls in real time."
      icon={<VideoCameraIcon className="w-8 h-8" />}
      features={[
        "Automatic calendar sync for Google Calendar & Outlook",
        "Real-time speaker detection and live transcription stream",
        "Custom bot avatar name and join timing preferences",
        "In-meeting live sentiment analysis and key moment tagging"
      ]}
    />
  );
}
