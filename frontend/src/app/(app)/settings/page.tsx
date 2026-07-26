"use client";

import { 
  UserCircleIcon, 
  BellIcon, 
  KeyIcon, 
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    icon: UserCircleIcon,
    description: "Manage your account name, email, and avatar.",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: BellIcon,
    description: "Configure email and in-app notification preferences.",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: GlobeAltIcon,
    description: "Connect Google Calendar, Zoom, Slack, and more.",
  },
  {
    id: "api",
    label: "API Keys",
    icon: KeyIcon,
    description: "Manage API keys for programmatic access.",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: PaintBrushIcon,
    description: "Customize theme, language, and display preferences.",
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheckIcon,
    description: "Two-factor authentication, sessions, and password.",
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const router = useRouter();
  const { addToast } = useToast();

  const handleLogout = () => {
    addToast("Logged out successfully.", "info");
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and application preferences.</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-gray-100 p-4 space-y-1 shrink-0">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-brand-primary/5 text-brand-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <section.icon className="w-5 h-5" />
              {section.label}
            </button>
          ))}

          <hr className="my-3 border-gray-100" />

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            Log Out
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {settingsSections.map((section) => {
            if (section.id !== activeSection) return null;
            return (
              <div key={section.id} className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.label}</h2>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>

                {/* Placeholder Content */}
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <section.icon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{section.label} Settings</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    This section is a placeholder. In a production app, this would contain the full {section.label.toLowerCase()} configuration panel.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
