import { useLiveQuery } from "dexie-react-hooks";
import { db, Book } from "@/lib/db";
import { useEffect } from "react";

export function useBooks() {
    const books = useLiveQuery(() => db.books.toArray());

    // Auto-seeding removed to prevent confusion with imported Google Drive content.
    // Use the Clear Library button in Admin to start fresh.

    const addBook = async (book: Book) => {
        await db.books.add(book);
    };

    const addBooks = async (newBooks: Book[]) => {
        await db.books.bulkAdd(newBooks);
    };

    const removeBook = async (id: number) => {
        await db.books.delete(id);
    };

    return { books, addBook, addBooks, removeBook };
}

