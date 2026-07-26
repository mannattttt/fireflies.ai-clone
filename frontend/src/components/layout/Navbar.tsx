import Link from "next/link";
import { UserCircleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xl">
          F
        </div>
        <span className="text-xl font-semibold text-text-primary tracking-tight">
          Fireflies.ai Clone
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link 
          href="/settings" 
          className="p-2 text-text-tertiary hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </Link>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-text-secondary hidden sm:block">
            Alex Morgan
          </span>
        </button>
      </div>
    </nav>
  );
}
