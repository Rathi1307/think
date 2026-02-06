"use client";

import { SyncStatus } from "@/components/sync-status";
import { BookOpen, Trophy, Flame } from "lucide-react";
import Link from 'next/link';
import { useUser } from "@/hooks/useUser";
import { BookCard } from "@/components/book-card";

export default function Home() {
  const { user } = useUser();
  const points = user?.totalPoints || 0;
  const BOOKS = [
    { id: 1, title: "Environmental Science", grade: "Grade 10", pages: 45, pdfUrl: "/sample.pdf" },
    { id: 2, title: "Advanced Biology", grade: "Grade 11", pages: 32, pdfUrl: "/science-book.pdf" },
    { id: 3, title: "World History", grade: "Grade 10", pages: 28, pdfUrl: "/sample.pdf" },
    { id: 4, title: "Mathematics", grade: "Grade 10", pages: 55, pdfUrl: "/sample.pdf" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header / Gamification Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            EcoLearn
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-lg">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>12</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-lg">
              <Trophy className="w-4 h-4 fill-yellow-500 text-yellow-600" />
              <span>{points} pts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">

        {/* Daily Goal Card */}
        <section className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-1">Daily Goal</h2>
          <p className="opacity-90 text-sm mb-4">Read for 30 minutes today</p>

          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full w-[40%]"></div>
          </div>
          <p className="text-xs text-right opacity-80">12 / 30 mins</p>
        </section>

        {/* Library Grid */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Your Library</h2>
            <button className="text-sm text-green-600 font-medium">See All</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <button className="flex flex-col items-center text-green-600">
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
