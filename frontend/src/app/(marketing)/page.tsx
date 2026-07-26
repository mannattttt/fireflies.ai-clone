import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121220] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xl">
            F
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Fireflies.ai
          </span>
        </div>
        <nav className="hidden md:flex gap-8 items-center text-base font-medium text-gray-600 dark:text-gray-300">
          <Link href="#features" className="hover:text-brand-primary transition-colors">Features</Link>
          <Link href="#use-cases" className="hover:text-brand-primary transition-colors">Use Cases</Link>
          <Link href="#pricing" className="hover:text-brand-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Log in
          </Link>
          <Link href="/dashboard" className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-base font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20">
            Get Started for Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-20 pb-32 px-4 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
            Automate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">meeting notes</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Fireflies.ai helps your team record, transcribe, search, and analyze voice conversations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard" className="bg-brand-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-primary-hover transition-transform hover:scale-105 shadow-xl shadow-brand-primary/20">
              Start for Free
            </Link>
            <button className="bg-white dark:bg-[#1a1a30] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 dark:hover:bg-[#262646] transition-colors">
              Request Demo
            </button>
          </div>
        </section>

        {/* Mockup Section */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="aspect-[16/9] bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
              {/* Dashboard UI Mockup */}
              <div className="w-full h-full bg-white border border-gray-200 rounded-xl shadow-sm flex overflow-hidden">
                {/* Mockup Sidebar */}
                <div className="w-48 bg-[#111827] flex-shrink-0 hidden sm:flex flex-col p-4 border-r border-gray-800">
                  <div className="flex gap-2 items-center mb-8">
                    <div className="w-6 h-6 rounded bg-brand-primary"></div>
                    <div className="h-4 w-20 bg-gray-600 rounded"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 w-3/4 bg-gray-600 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                    <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                  </div>
                </div>
                
                {/* Mockup Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Mockup Topbar */}
                  <div className="h-12 border-b border-gray-100 flex items-center px-6">
                    <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
                  </div>
                  
                  {/* Mockup 3-Pane Interface */}
                  <div className="flex-1 flex p-6 gap-6">
                    {/* Transcript Pane (Animated) */}
                    <div className="flex-1 space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-1/4 bg-gray-300 rounded"></div>
                          <div className="h-3 w-full bg-gray-200 rounded"></div>
                          <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-1/3 bg-gray-300 rounded"></div>
                          <div className="h-3 w-11/12 bg-gray-200 rounded"></div>
                          
                          {/* Animated typing line */}
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-1/2 bg-brand-primary/60 rounded animate-pulse"></div>
                            <div className="w-1.5 h-3 bg-brand-primary animate-ping"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Pane (Right Sidebar) */}
                    <div className="w-1/3 bg-gray-50 rounded-xl p-4 hidden md:block border border-gray-100">
                      <div className="h-4 w-1/3 bg-gray-300 rounded mb-4"></div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="h-2 w-full bg-gray-200 rounded"></div>
                        <div className="h-2 w-full bg-gray-200 rounded"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                      
                      <div className="h-4 w-1/2 bg-gray-300 rounded mb-4"></div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm border border-brand-primary/50"></div>
                          <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm border border-brand-primary/50"></div>
                          <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 dark:bg-[#16162a] py-24 transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need for better meetings</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Capture every detail and make your meetings instantly searchable.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Record & Transcribe", desc: "Automatically join and record meetings across all major web-conferencing platforms." },
                { title: "AI Super Summaries", desc: "Get detailed overviews, action items, and key takeaways generated instantly." },
                { title: "Smart Search", desc: "Find exactly what you're looking for in seconds across your entire meeting history." }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-[#1a1a30] p-8 rounded-2xl border border-gray-100 dark:border-[#2a2a4a] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#121220] border-t border-gray-100 dark:border-[#2a2a4a] py-12 px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xs">
              F
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Fireflies.ai Clone</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">© {new Date().getFullYear()} Fireflies.ai Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
