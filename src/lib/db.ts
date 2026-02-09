import Dexie, { type EntityTable } from 'dexie';

interface User {
    id: string; // Remote ID
    name: string;
    totalPoints: number;
}

interface ReadingSession {
    id?: number; // Local Auto-increment
    bookId: string;
    startTime: number;
    endTime?: number;
    synced: 0 | 1; // 0 = false, 1 = true
}

interface SyncTask {
    id?: number;
    type: 'UPDATE_POINTS' | 'READ_LOG';
    payload: any;
    createdAt: number;
}

const db = new Dexie('AdaptivePlatformDB') as Dexie & {
    users: EntityTable<User, 'id'>;
    readings: EntityTable<ReadingSession, 'id'>;
    syncQueue: EntityTable<SyncTask, 'id'>;
};

// Schema definition
db.version(2).stores({
    users: 'id, name, totalPoints',
    readings: '++id, bookId, synced, startTime',
    syncQueue: '++id, type, createdAt'
});

export { db };
export type { User, ReadingSession, SyncTask };
