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
  LinkIcon,
  UsersIcon,
  Cog6ToothIcon,
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

const mobileNavItems = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "People", href: "/team", icon: UserGroupIcon },
  { name: "Live Bot", href: "/live-bot", icon: VideoCameraIcon },
  { name: "Apps", href: "/integrations", icon: LinkIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar (visible on md+ screens) */}
      <aside className="w-[52px] bg-[#1a1a2e] hidden md:flex flex-col h-screen border-r border-[#2a2a4a] shrink-0 items-center py-3 z-30">
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

      {/* Mobile Bottom Navigation Bar (visible on < md screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#1a1a2e] border-t border-[#2a2a4a] flex items-center justify-around z-50 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/meetings"));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive 
                  ? "text-[#a78bfa]" 
                  : "text-[#8b8ba3] hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
