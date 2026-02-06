import { useLiveQuery } from "dexie-react-hooks";
import { db, User } from "@/lib/db";
import { useEffect, useState } from "react";

export function useUser() {
    const users = useLiveQuery(() => db.users.toArray());
    const user = users?.[0]; // Single user mode for now

    // Initialize default user if none exists
    useEffect(() => {
        const initUser = async () => {
            const count = await db.users.count();
            if (count === 0) {
                await db.users.add({
                    id: 'local-user', // This would be replaced by server ID after sync
                    name: 'Student',
                    totalPoints: 0
                });
            }
        };
        initUser();
    }, []);

    return { user };
}
