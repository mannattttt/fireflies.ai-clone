"use client";

import ComingSoonPage from "@/components/ui/ComingSoonPage";
import { LinkIcon } from "@heroicons/react/24/outline";

export default function IntegrationsPage() {
  return (
    <ComingSoonPage 
      title="Apps & Integrations"
      description="Automatically push meeting summaries, action items, and notes to your favorite CRMs, project management tools, and chat channels."
      icon={<LinkIcon className="w-8 h-8" />}
      features={[
        "Slack & Microsoft Teams channel notifications",
        "HubSpot, Salesforce & Pipedrive CRM automatic logging",
        "Asana, Trello, Jira, and Monday.com action item creation",
        "Notion & Google Docs automated summary exports"
      ]}
    />
  );
}
