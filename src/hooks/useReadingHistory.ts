import { useLiveQuery } from "dexie-react-hooks";
import { db, Book } from "@/lib/db";
import { useUser } from "./useUser";

export function useReadingHistory() {
    const { user } = useUser();

    const recentBooks = useLiveQuery(async () => {
        if (!user) return [];

        // Get all reading sessions for the user (simulation: we filter by what's local since auth is local-first)
        // In a real app with sync, we'd filter by userId. 
        // Here, db.readings doesn't have userId because it's a local-first single-user-per-device assumption for the offline demo,
        // or we assume 'local-user' is the only one. 
        // However, to be robust, let's just get the latest readings.

        const sessions = await db.readings
            .orderBy("startTime")
            .reverse()
            .limit(10)
            .toArray();

        // Get unique book IDs
        const uniqueBookIds = Array.from(new Set(sessions.map(s => s.bookId)));

        // Fetch books
        const books = await db.books.where("id").anyOf(uniqueBookIds.map(Number)).toArray();

        // Sort books by the order they appeared in reading sessions (most recent first)
        const sortedBooks = uniqueBookIds.map(id => books.find(b => b.id === Number(id))).filter(Boolean) as Book[];

        return sortedBooks.slice(0, 3); // Return top 3
    }, [user]);

    return { recentBooks };
}
