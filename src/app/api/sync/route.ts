import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type definition for the Sync Task payload
type SyncPayload = {
    type: 'UPDATE_POINTS' | 'READ_LOG';
    payload: any;
    id?: number; // IndexedDB ID
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, payload } = body as SyncPayload;

        console.log(`[API] Received sync task: ${type}`, payload);

        if (type === 'READ_LOG') {
            // 1. Ensure User Exists (Update Total Points First)
            const { data: userData } = await supabase
                .from('users')
                .select('total_points')
                .eq('id', 'local-user')
                .single();

            const currentPoints = userData?.total_points || 0;
            const newTotal = currentPoints + payload.pointsEarned;

            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: 'local-user',
                    total_points: newTotal,
                    name: 'Student' // Default name if creating new
                });

            if (userError) {
                console.error('[API] Error updating user:', userError);
                return NextResponse.json({ error: userError.message }, { status: 500 });
            }

            // 2. Insert Reading Session (Now safe because user exists)
            const { error: sessionError } = await supabase
                .from('reading_sessions')
                .insert({
                    user_id: 'local-user',
                    book_id: payload.bookId,
                    duration: payload.duration,
                    points_earned: payload.pointsEarned,
                    start_time: Date.now() - (payload.duration * 1000), // Approximate start time if not sent
                    end_time: Date.now()
                });

            if (sessionError) {
                console.error('[API] Error saving session:', sessionError);
                return NextResponse.json({ error: sessionError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[API] Sync failed:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
