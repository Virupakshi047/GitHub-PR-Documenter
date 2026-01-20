const { google } = require('googleapis');
const path = require('path');
const stream = require('stream');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-credentials.json'),
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents'
    ],
});

const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

async function uploadToGoogle(repo, prNumber, content) {
    const SHARED_DRIVE_ID = '0APxiz-P4FWE8Uk9PVA';
    const dateStr = new Date().toISOString().split('T')[0];
    const folderName = `PR-Docs-${dateStr}`;

    let folderId;
    const folderSearch = await drive.files.list({
        q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${SHARED_DRIVE_ID}' in parents and trashed = false`,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: 'drive',
        driveId: SHARED_DRIVE_ID,
        fields: 'files(id)',
    });

    if (folderSearch.data.files.length > 0) {
        folderId = folderSearch.data.files[0].id;
    } else {
        const folder = await drive.files.create({
            supportsAllDrives: true,
            resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [SHARED_DRIVE_ID]
            },
            fields: 'id',
        });
        folderId = folder.data.id;
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(content);
    // 2. Create the Google Doc
    const doc = await drive.files.create({
        supportsAllDrives: true,
        resource: {
            name: `${repo}-PR${prNumber}`,
            mimeType: 'application/vnd.google-apps.document',
            parents: [folderId]
        },
        fields: 'id',
        media: {
            // This tells Google the incoming data is Markdown
            mimeType: 'text/markdown',
            body: bufferStream
        }
    });



    return `https://docs.google.com/document/d/${doc.data.id}/edit`;
}

module.exports = { uploadToGoogle };