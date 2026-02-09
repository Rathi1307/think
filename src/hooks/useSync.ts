import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function useSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const syncQueueCount = useLiveQuery(() => db.syncQueue.count()) || 0;

    useEffect(() => {
        // Check initial status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            attemptSync(); // Auto-sync when coming online
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const attemptSync = async () => {
        console.log(`[Sync] Attempting sync. Online: ${navigator.onLine}, Queue: ${syncQueueCount}, Syncing: ${isSyncing}`);
        if (!navigator.onLine || syncQueueCount === 0) return;

        setIsSyncing(true);
        try {
            const pendingTasks = await db.syncQueue.toArray();
            console.log(`[Sync] Found ${pendingTasks.length} pending tasks`);

            // Process tasks sequentially
            for (const task of pendingTasks) {
                console.log(`[Sync] Processing task ${task.id}`, task);
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/sync';

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(task)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[Sync] Server error: ${response.status}`, errorText);
                        throw new Error(`Sync failed with status: ${response.status}`);
                    }

                    // Remove from queue on success
                    if (task.id) await db.syncQueue.delete(task.id);

                    console.log(`[Sync] Successfully synced task ${task.id}`);

                } catch (err) {
                    console.error(`[Sync] Failed to sync task ${task.id}`, err);
                    // Stop processing remaining queue if one fails, to preserve order
                    break;
                }
            }
        } catch (error) {
            console.error("[Sync] Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    return { isOnline, isSyncing, syncQueueCount, attemptSync };
}
