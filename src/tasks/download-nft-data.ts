import {
  fetchNFTData,
  fetchNFTDataFromJson,
} from '../services/moralis.services';
// import { uploadToDrive } from '../services/google-drive.services';
import { saveJSONToFile, createDirectory } from '../utils/file.utils';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { uploadToDrive } from 'services/google-drive.services';

const CONTRACT_ADDRESS = '0xe6115ada0452d6c48b292971e656bc07901b53f6';

interface NFT {
  normalized_metadata: any; // Replace 'any' with the actual type if known
}

const downloadImages = async (nfts: any[]) => {
  const imagesDir = path.join(__dirname, '../../mounts_images');
  createDirectory(imagesDir); // Ensure this function exists and creates the directory if needed
  // Check how many files are in the images directory
  const existingFiles = fs.readdirSync(imagesDir);
  console.log(
    `Number of files in the images directory: ${existingFiles.length}`
  );

  for (const nft of nfts) {
    const { token_id, normalized_metadata } = nft;

    let imageUrl = normalized_metadata?.image;

    const ipfsGateway = 'https://dweb.link/ipfs/';

    // Add IPFS gateway if the image URL starts with "ipfs://"
    if (imageUrl?.startsWith('ipfs://')) {
      imageUrl = imageUrl.replace('ipfs://', ipfsGateway);
    }

    if (!imageUrl) {
      console.error('Image URL is not available in metadata.');
      continue; // Skip to the next NFT
    }

    const imagePath = path.join(imagesDir, `${token_id}.png`);

    // Check if the file already exists
    if (fs.existsSync(imagePath)) {
      //   console.log(
      //     `Image for token ID ${token_id} already exists. Skipping download.`
      //   );
      continue; // Skip to the next NFT
    }

    try {
      const response = await axios.get(imageUrl, {
        responseType: 'stream',
      });
      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Downloaded image for token ID: ${token_id}`);
    } catch (error: unknown) {
      console.error(
        `Error downloading image for token ID ${token_id}:`,
        (error as Error).message
      );
    }
  }
};

const main = async () => {
  try {
    console.log('Fetching NFT data...');
    const nfts = await fetchNFTData(CONTRACT_ADDRESS);

    // const nfts = await fetchNFTDataFromJson('mounts_metadata.json');
    console.log('Downloading images...');
    await downloadImages(nfts);

    console.log('Saving metadata...');
    const metadataArray = nfts.map((nft: NFT) => nft.normalized_metadata);
    saveJSONToFile(nfts, 'mounts_data.json');

    console.log('Uploading files to Google Drive...');
    const imagesDir = path.join(__dirname, '../../mounts_images');
    const metadataFilePath = path.join(__dirname, '../../mounts_metadata.json');

    const imageFiles = fs.readdirSync(imagesDir);
    for (const file of imageFiles) {
      await uploadToDrive(path.join(imagesDir, file), 'image/png');
    }

    // await uploadToDrive(metadataFilePath, 'application/json');
    console.log('======Task completed successfully!=====');
  } catch (error: unknown) {
    console.error('Task failed:', (error as Error).message);
  }
};

main();
