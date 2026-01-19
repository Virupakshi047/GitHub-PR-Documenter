const { google } = require('googleapis');
const path = require('path');

// Load your existing credentials
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function cleanDrive() {
    console.log("🧹 Scanning Service Account's Drive...");

    try {
        // 1. List all files owned by the Service Account (not just in the shared folder)
        const res = await drive.files.list({
            q: "'me' in owners and trashed = false",
            fields: 'files(id, name, size)',
        });

        const files = res.data.files;
        console.log(`Found ${files.length} active files occupying space.`);

        // 2. Delete them
        for (const file of files) {
            console.log(`Deleting: ${file.name} (${file.id})...`);
            await drive.files.delete({ fileId: file.id });
        }

        // 3. EMPTY THE TRASH (Crucial: Deleting just moves to trash, which still takes space)
        console.log("🗑️ Emptying Trash...");
        await drive.files.emptyTrash();

        console.log("✅ Drive is clean! Try generating docs again.");

    } catch (error) {
        console.error("Error cleaning drive:", error.message);
    }
}

cleanDrive();