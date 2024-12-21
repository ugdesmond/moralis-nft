import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';
const AUTH_JSON_PATH = path.join(__dirname, '../../credentials.json');

export const uploadToDrive = async (filePath: string, mimeType: string) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: AUTH_JSON_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileName = path.basename(filePath);
  const fileMetadata = { name: fileName, parents: [DRIVE_FOLDER_ID] };
  const media = { mimeType, body: fs.createReadStream(filePath) };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });
    console.log(
      `Uploaded ${fileName} to Google Drive. File ID: ${file.data.id}`
    );
  } catch (error) {
    console.error(`Failed to upload ${fileName}:`, (error as Error).message);
  }
};
