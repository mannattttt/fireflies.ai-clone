"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  UserGroupIcon,
  VideoCameraIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  UsersIcon,
  StarIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

const topNavItems = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "People", href: "/team", icon: UserGroupIcon },
  { name: "Live Bot", href: "/live-bot", icon: VideoCameraIcon },
  { name: "AI Apps", href: "/dashboard", icon: SparklesIcon },
  { name: "STT Engine", href: "/transcription", icon: ArrowUpTrayIcon },
  { name: "Analytics", href: "/dashboard", icon: ChartBarIcon },
  { name: "Integrations", href: "/integrations", icon: LinkIcon },
];

const bottomNavItems = [
  { name: "Team Workspaces", href: "/team", icon: UsersIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[52px] bg-[#1a1a2e] flex flex-col h-[calc(100vh-3.5rem)] border-r border-[#2a2a4a] sticky top-14 shrink-0 items-center py-3">
      {/* Logo */}
      <Link href="/dashboard" className="mb-4">
        <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-[#6c5ce7] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm">
          F
        </div>
      </Link>

      {/* Top Nav Icons */}
      <div className="flex-1 flex flex-col items-center gap-0.5">
        {topNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/meetings"));
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                isActive 
                  ? "bg-[#6c5ce7]/20 text-[#a78bfa]" 
                  : "text-[#8b8ba3] hover:bg-[#2a2a4a] hover:text-[#c4c4d4]"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
            </Link>
          );
        })}
      </div>

      {/* Bottom Nav Icons */}
      <div className="flex flex-col items-center gap-0.5 pt-2 border-t border-[#2a2a4a]">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                isActive 
                  ? "bg-[#6c5ce7]/20 text-[#a78bfa]" 
                  : "text-[#8b8ba3] hover:bg-[#2a2a4a] hover:text-[#c4c4d4]"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
