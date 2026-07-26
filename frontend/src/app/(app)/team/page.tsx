"use client";

import ComingSoonPage from "@/components/ui/ComingSoonPage";
import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function TeamPage() {
  return (
    <ComingSoonPage 
      title="Team & Collaboration Workspaces"
      description="Invite your team members to share meeting notes, co-edit transcripts, and organize conversations across shared workspace channels."
      icon={<UserGroupIcon className="w-8 h-8" />}
      features={[
        "Shared Team Notebooks and custom channel permissions",
        "Real-time collaborative editing on meeting notes & summaries",
        "Role-based access control (Admin, Member, Viewer)",
        "Soundbites & snippet playlist sharing for sales training"
      ]}
    />
  );
}
