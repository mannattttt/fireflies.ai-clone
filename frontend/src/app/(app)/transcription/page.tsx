"use client";

import ComingSoonPage from "@/components/ui/ComingSoonPage";
import { MicrophoneIcon } from "@heroicons/react/24/outline";

export default function TranscriptionEnginePage() {
  return (
    <ComingSoonPage 
      title="Speech-to-Text Transcription Engine"
      description="High-accuracy multi-language audio and video speech-to-text processing powered by Whisper & Deepgram models."
      icon={<MicrophoneIcon className="w-8 h-8" />}
      features={[
        "Support for 60+ global languages and dialect detection",
        "Custom vocabulary dictionary for technical jargon & industry terms",
        "Automated multi-speaker diarization and voice biometric tagging",
        "Direct MP3/WAV/MP4 audio file upload and background processing"
      ]}
    />
  );
}
