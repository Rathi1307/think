export interface DriveItem {
    id: string;
    name: string;
    mimeType: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;

export async function fetchDriveContents(folderId: string): Promise<DriveItem[]> {
    if (!API_KEY) {
        throw new Error("NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY is not defined in .env.local");
    }

    const url = new URL("https://www.googleapis.com/drive/v3/files");
    // Fetch folders, PDFs, and Shortcuts
    url.searchParams.append("q", `'${folderId}' in parents and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.shortcut') and trashed = false`);
    url.searchParams.append("fields", "files(id, name, mimeType, shortcutDetails)");
    url.searchParams.append("pageSize", "1000");
    url.searchParams.append("key", API_KEY);
    url.searchParams.append("supportsAllDrives", "true");
    url.searchParams.append("includeItemsFromAllDrives", "true");

    const response = await fetch(url.toString());

    if (!response.ok) {
        const error = await response.json();
        console.error(`[DriveAPI] Error fetching ${folderId}:`, error);
        throw new Error(error.error?.message || "Failed to fetch from Google Drive");
    }

    const data = await response.json();
    console.log(`[DriveAPI] Fetched ${folderId}, found ${data.files?.length || 0} items`);
    return data.files || [];
}

export function getDirectDownloadUrl(fileId: string): string {
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
}
