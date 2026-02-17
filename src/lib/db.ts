import Dexie, { type EntityTable } from 'dexie';

interface User {
    id: string; // Remote ID
    name: string;
    mobile: string; // Added for local auth
    age?: number;
    city?: string;
    school?: string;
    password?: string; // Simple local password for demo
    totalPoints: number;
}

interface ReadingSession {
    id?: number; // Local Auto-increment
    bookId: string;
    startTime: number;
    endTime?: number;
    synced: 0 | 1; // 0 = false, 1 = true
}

interface Book {
    id?: number;
    title: string;
    grade: string;
    pages: number;
    pdfUrl: string;
    level: string;
    subject: string;
    language: string;
    coverUrl?: string;
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
    books: EntityTable<Book, 'id'>;
};

// Schema definition
db.version(6).stores({ // Incremented version to apply changes
    users: 'id, name, mobile, totalPoints', // Added mobile to index
    readings: '++id, bookId, synced, startTime',
    syncQueue: '++id, type, createdAt',
    books: '++id, title, grade, level, subject, language'
});

// Seed default user
db.on('populate', async () => {
    await db.users.add({
        id: 'local-admin',
        name: 'Test Student',
        mobile: '1234567890',
        password: 'admin',
        totalPoints: 0,
        school: 'ThinkSharp School',
        city: 'Mumbai',
        age: 12
    });
});

export { db };
export type { User, ReadingSession, SyncTask, Book };
