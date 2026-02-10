"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Download, Loader2, CheckCircle2 } from "lucide-react";

interface BookCardProps {
    id: number;
    title: string;
    grade: string;
    pages: number;
    pdfUrl: string;
    coverUrl?: string;
}

export function BookCard({ id, title, grade, pages, pdfUrl, coverUrl }: BookCardProps) {

    const [downloading, setDownloading] = useState(false);
    const [isOfflineReady, setIsOfflineReady] = useState(false);

    // Check if book is already cached on mount
    useEffect(() => {
        checkCache();
    }, [pdfUrl]);

    async function checkCache() {
        try {
            const cache = await caches.open('next-pwa-cache');
            const match = await cache.match(pdfUrl);
            if (match) setIsOfflineReady(true);
        } catch (e) {
            // Ignore cache errors in environments where it might not exist
        }
    }

    async function handleDownload(e: React.MouseEvent) {
        e.preventDefault(); // Prevent navigation when clicking download
        if (isOfflineReady) return;

        setDownloading(true);
        try {
            const cache = await caches.open('next-pwa-cache');
            const response = await fetch(pdfUrl);
            if (response.ok) {
                await cache.put(pdfUrl, response.clone());
                setIsOfflineReady(true);
            }
        } catch (error) {
            console.error("Download failed:", error);
            alert("Download failed. Check your connection.");
        } finally {
            setDownloading(false);
        }
    }

    return (
        <Link href={`/read/${id}`} className="block text-left group/card relative">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform h-full">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                    {/* Cover Image or Placeholder */}
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <BookOpen className="w-8 h-8" />
                        </div>
                    )}


                    {/* Download Overlay Button */}
                    <button
                        onClick={handleDownload}
                        disabled={downloading || isOfflineReady}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-full shadow-md transition-all z-10 
              ${isOfflineReady
                                ? 'bg-green-100 text-green-600'
                                : 'bg-white text-gray-600 hover:bg-green-600 hover:text-white'}`}
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isOfflineReady ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                    </button>
                </div>

                <h3 className="font-semibold text-gray-800 line-clamp-1 leading-tight">{title}</h3>
                <p className="text-xs text-gray-500 mt-1">{grade} • {pages} pages</p>

                {isOfflineReady && (
                    <span className="text-[10px] text-green-600 font-medium inline-block mt-1">Available Offline</span>
                )}
            </div>
        </Link>
    );
}
