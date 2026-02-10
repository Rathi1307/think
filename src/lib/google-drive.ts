export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
    webContentLink?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;

export async function fetchDriveFolder(folderId: string): Promise<DriveFile[]> {
    if (!API_KEY) {
        throw new Error("NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY is not defined in .env.local");
    }

    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.append("q", `'${folderId}' in parents and (mimeType = 'application/pdf' or mimeType contains 'image/') and trashed = false`);
    url.searchParams.append("fields", "files(id, name, mimeType, webViewLink, webContentLink)");
    url.searchParams.append("pageSize", "1000"); // Maximum allowed per page
    url.searchParams.append("key", API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to fetch from Google Drive");
    }

    const data = await response.json();
    return data.files || [];
}

export function getDirectDownloadUrl(fileId: string): string {
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
}
