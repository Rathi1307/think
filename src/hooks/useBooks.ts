import { useLiveQuery } from "dexie-react-hooks";
import { db, Book } from "@/lib/db";
import { useEffect } from "react";

export function useBooks() {
    const books = useLiveQuery(() => db.books.toArray());

    // Seed default books if empty
    useEffect(() => {
        const seedBooks = async () => {
            const count = await db.books.count();
            if (count === 0) {
                console.log("[Books] Seeding default books");
                const defaultBooks: Book[] = [
                    { title: "Environmental Science", grade: "Grade 10", pages: 45, pdfUrl: "/sample.pdf", level: "1", subject: "Science", language: "English" },
                    { title: "Advanced Biology", grade: "Grade 11", pages: 32, pdfUrl: "/science-book.pdf", level: "2", subject: "Science", language: "English" },
                    { title: "World History", grade: "Grade 10", pages: 28, pdfUrl: "/sample.pdf", level: "1", subject: "History", language: "English" },
                    { title: "Mathematics", grade: "Grade 10", pages: 55, pdfUrl: "/sample.pdf", level: "3", subject: "Mathematics", language: "English" },
                    { title: "Physics Basics", grade: "Grade 9", pages: 40, pdfUrl: "/sample.pdf", level: "1", subject: "Science", language: "English" },
                    { title: "Algebra II", grade: "Grade 11", pages: 60, pdfUrl: "/sample.pdf", level: "4", subject: "Mathematics", language: "English" },
                ];
                await db.books.bulkAdd(defaultBooks);
            }
        };
        seedBooks();
    }, []);

    const addBook = async (book: Book) => {
        await db.books.add(book);
    };

    const removeBook = async (id: number) => {
        await db.books.delete(id);
    };

    return { books, addBook, removeBook };
}
