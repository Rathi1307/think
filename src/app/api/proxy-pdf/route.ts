import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
        return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        // Use the user-content download endpoint which is often more reliable for public files
        const driveUrl = `https://docs.google.com/uc?export=download&id=${fileId}&key=${apiKey}`;

        const response = await fetch(driveUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ProxyAPI] Google API Error (${response.status}):`, errorText.substring(0, 200));
            throw new Error(`Google Drive API responded with ${response.status}`);
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        // Allow caching of the response
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error('[ProxyAPI] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
