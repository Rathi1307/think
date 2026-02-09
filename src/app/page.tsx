"use client";

import { SyncStatus } from "@/components/sync-status";
import { BookOpen, Trophy, Flame, Wifi, WifiOff, Laptop, Smartphone, LogIn, LogOut } from "lucide-react";
import Link from 'next/link';
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { BookCard } from "@/components/book-card";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useDeviceType } from "@/hooks/useDeviceType";

export default function Home() {
  const { user } = useUser();
  const isOnline = useNetworkStatus();
  const { isMobile } = useDeviceType();

  const points = user?.totalPoints || 0;
  const BOOKS = [
    { id: 1, title: "Environmental Science", grade: "Grade 10", pages: 45, pdfUrl: "/sample.pdf" },
    { id: 2, title: "Advanced Biology", grade: "Grade 11", pages: 32, pdfUrl: "/science-book.pdf" },
    { id: 3, title: "World History", grade: "Grade 10", pages: 28, pdfUrl: "/sample.pdf" },
    { id: 4, title: "Mathematics", grade: "Grade 10", pages: 55, pdfUrl: "/sample.pdf" },
  ];

  return (
    <main className={`min-h-screen pb-20 transition-colors duration-500 ${isOnline ? 'bg-gray-50' : 'bg-stone-100'}`}>
      {/* Header / Gamification Bar */}
      <header className={`sticky top-0 z-10 px-4 py-4 shadow-sm transition-colors duration-300 ${isOnline ? 'bg-white' : 'bg-stone-200'}`}>
        <div className={`flex justify-between items-center mx-auto ${isMobile ? 'max-w-md' : 'max-w-4xl'}`}>
          <h1 className={`text-xl font-bold flex items-center gap-2 ${isOnline ? 'text-green-700' : 'text-stone-700'}`}>
            <BookOpen className="w-6 h-6" />
            EcoLearn
          </h1>

          <div className="flex items-center gap-3">
            {/* Status Indicators for Demo */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-gray-500">
              {isMobile ? <Smartphone className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
              <span>{isMobile ? "Mobile" : "Desktop"}</span>
              <span className="w-px h-3 bg-gray-300 mx-1" />
              {isOnline ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>

            <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-lg">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>12</span>
            </div>

            <div className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-lg">
              <Trophy className="w-4 h-4 fill-yellow-500 text-yellow-600" />
              <span>{points} pts</span>
            </div>

            {/* Auth Button */}
            {user?.id !== 'local-user' ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-2 py-1 rounded-lg"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-green-700 font-bold bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`mx-auto px-4 mt-6 space-y-6 ${isMobile ? 'max-w-md' : 'max-w-4xl'}`}>

        {/* Dynamic Warning Banner */}
        {!isOnline && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              <p className="font-bold">You are currently offline.</p>
            </div>
            <p className="text-sm mt-1">You can still read your downloaded books. Progress will sync when you're back online.</p>
          </div>
        )}

        {/* Daily Goal Card */}
        <section className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${isOnline ? 'from-green-500 to-emerald-600' : 'from-stone-500 to-stone-600 grayscale-[0.2]'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold mb-1">Daily Goal</h2>
              <p className="opacity-90 text-sm mb-4">Read for 30 minutes today</p>
            </div>
            {!isMobile && (
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="w-8 h-8 opacity-80" />
              </div>
            )}
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full w-[40%]"></div>
          </div>
          <p className="text-xs text-right opacity-80">12 / 30 mins</p>
        </section>

        {/* Library Grid */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Your Library</h2>
            <button className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-stone-500'}`}>See All</button>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'}`}>
            {BOOKS.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                grade={book.grade}
                pages={book.pages}
                pdfUrl={book.pdfUrl}
              />
            ))}
          </div>
        </section>
      </div>

      <SyncStatus />

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t py-3 px-6 transition-colors duration-300 ${isOnline ? 'bg-white border-gray-200' : 'bg-stone-100 border-stone-200'}`}>
        <div className={`mx-auto flex justify-around ${isMobile ? 'max-w-md' : 'max-w-4xl'}`}>
          <button className={`flex flex-col items-center ${isOnline ? 'text-green-600' : 'text-stone-600'}`}>
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Library</span>
          </button>
          <Link href="/leaderboard" className="flex flex-col items-center text-gray-400 hover:text-green-600 transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">Rank</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
