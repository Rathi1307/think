"use client";

import { useState, useEffect, useRef } from 'react';
import { PdfReader } from '@/components/pdf-reader';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';


export default function ReadPage() {
    const params = useParams();
    const bookId = typeof params.bookId === 'string' ? params.bookId : '1';

    // Mock Database for Books
    const BOOKS: Record<string, string> = {
        '1': '/sample.pdf',
        '2': '/science-book.pdf',
        '3': '/sample.pdf',
        '4': '/sample.pdf'
    };

    const pdfUrl = BOOKS[bookId] || '/sample.pdf';

    // State for tracking per-page time
    const [currentPage, setCurrentPage] = useState(1); // Track current page
    const pageStartTimeRef = useRef(Date.now());
    const accumulatedPointsRef = useRef(0);
    const MAX_POINTS_PER_PAGE = 5; // Cap at 5 points (50 seconds) per page visit

    // Global Session Tracking
    const startTimeRef = useRef(Date.now());
    const secondsReadRef = useRef(0);
    const [displaySeconds, setDisplaySeconds] = useState(0);

    // Timer only for display
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const sessionDuration = Math.floor((now - startTimeRef.current) / 1000);
            setDisplaySeconds(sessionDuration);
            secondsReadRef.current = sessionDuration;
        }, 1000);

        return () => {
            clearInterval(interval);
            // Notice: saveProgress is called by the unmount closure
            // We need to ensure we capture the final page's points here or in saveProgress
            saveProgress();
        };
    }, []);

    // Handle Page Change
    const handlePageChange = (newPage: number) => {
        const now = Date.now();
        const durationOnPage = (now - pageStartTimeRef.current) / 1000;

        // Calculate points for the page we just left
        const pointsForPage = Math.min(Math.floor(durationOnPage / 10), MAX_POINTS_PER_PAGE);

        if (pointsForPage > 0) {
            accumulatedPointsRef.current += pointsForPage;
            console.log(`Page ${currentPage} done: ${durationOnPage.toFixed(1)}s -> ${pointsForPage} pts. Total: ${accumulatedPointsRef.current}`);
        }

        // Reset for new page
        pageStartTimeRef.current = now;
        setCurrentPage(newPage);
    };

    const saveProgress = async () => {
        // Calculate potential points for the *current* page (the one being closed)
        const now = Date.now();
        const durationOnFinalPage = (now - pageStartTimeRef.current) / 1000;
        const pointsForFinalPage = Math.min(Math.floor(durationOnFinalPage / 10), MAX_POINTS_PER_PAGE);

        const totalSessionPoints = accumulatedPointsRef.current + pointsForFinalPage;

        // Use total session duration for logs, but points are now capped
        const totalDuration = Math.floor((now - startTimeRef.current) / 1000);

        if (totalSessionPoints === 0 && totalDuration < 5) return;

        console.log(`Saving session: ${totalDuration}s, Points: ${totalSessionPoints}`);

        try {
            // 1. Save Reading Session
            await db.readings.add({
                bookId: bookId,
                startTime: startTimeRef.current,
                endTime: Date.now(),
                synced: 0
            });

            // 2. Update User Points
            const users = await db.users.toArray();
            if (users.length > 0) {
                const user = users[0];
                await db.users.update(user.id, {
                    totalPoints: (user.totalPoints || 0) + totalSessionPoints
                });
            }

            // 3. Add to Sync Queue
            await db.syncQueue.add({
                type: 'READ_LOG',
                payload: {
                    bookId,
                    duration: totalDuration,
                    pointsEarned: totalSessionPoints
                },
                createdAt: Date.now()
            });

            console.log(`Saved! Earned ${totalSessionPoints} points.`);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-20">
                <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <h1 className="font-semibold text-gray-800 text-sm">Environmental Science</h1>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(displaySeconds / 60)}:{(displaySeconds % 60).toString().padStart(2, '0')}</span>
                </div>
            </header>

            {/* Reader Area */}
            <main className="flex-1 p-4 flex justify-center">
                <PdfReader
                    url={pdfUrl}
                    onPageChange={handlePageChange}
                />
            </main>
        </div>
    );
}
