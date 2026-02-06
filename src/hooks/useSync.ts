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
        if (!navigator.onLine || syncQueueCount === 0) return;

        setIsSyncing(true);
        try {
            const pendingTasks = await db.syncQueue.toArray();

            // Process tasks sequentially
            for (const task of pendingTasks) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/sync';

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(task)
                    });

                    if (!response.ok) {
                        throw new Error(`Sync failed with status: ${response.status}`);
                    }

                    // Remove from queue on success
                    if (task.id) await db.syncQueue.delete(task.id);

                    console.log(`Synced task ${task.id}: ${task.type}`);

                } catch (err) {
                    console.error(`Failed to sync task ${task.id}`, err);
                    // Stop processing remaining queue if one fails, to preserve order
                    break;
                }
            }
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    return { isOnline, isSyncing, syncQueueCount, attemptSync };
}
