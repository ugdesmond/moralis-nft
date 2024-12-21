import fs from 'fs';
import path from 'path';

export const saveJSONToFile = (data: any, fileName: string) => {
  const filePath = path.join(__dirname, '../../', fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved data to ${fileName}`);
};

export const createDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};
