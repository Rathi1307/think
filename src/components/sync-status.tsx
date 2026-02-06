"use client";

import { useSync } from "@/hooks/useSync";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncStatus() {
    const { isOnline, isSyncing, syncQueueCount, attemptSync } = useSync();

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all",
                isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
                {isOnline ? (
                    <Wifi className="w-4 h-4" />
                ) : (
                    <WifiOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                    {isOnline ? "Online" : "Offline"}
                </span>

                {syncQueueCount > 0 && (
                    <div className="flex items-center gap-2 ml-2 border-l pl-2 border-gray-300">
                        <span className="text-xs">{syncQueueCount} pending</span>
                        <button
                            onClick={attemptSync}
                            disabled={!isOnline || isSyncing}
                            className="p-1 hover:bg-black/5 rounded-full"
                        >
                            <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
