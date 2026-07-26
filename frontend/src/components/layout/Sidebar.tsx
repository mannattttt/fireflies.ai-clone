"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  SquaresPlusIcon 
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Notebook", href: "/dashboard", icon: HomeIcon },
  { name: "Notes", href: "/notes", icon: DocumentTextIcon },
  { name: "Tasks", href: "/tasks", icon: ClipboardDocumentCheckIcon },
  { name: "Integrations", href: "/integrations", icon: SquaresPlusIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-text hidden md:flex flex-col h-[calc(100vh-4rem)] border-r border-gray-800 sticky top-16 shrink-0">
      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                isActive 
                  ? "bg-sidebar-active text-sidebar-text-active" 
                  : "hover:bg-sidebar-hover hover:text-sidebar-text-active"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-lg p-4">
          <p className="text-xs font-semibold text-brand-secondary uppercase tracking-wider mb-1">Pro Plan</p>
          <p className="text-sm text-sidebar-text mb-3">You have 450 minutes left this month.</p>
          <button className="w-full py-1.5 text-sm bg-sidebar-active hover:bg-white hover:text-sidebar-bg text-sidebar-text-active rounded-md transition-colors font-medium">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
