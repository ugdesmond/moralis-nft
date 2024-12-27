import axios from 'axios';
import path from 'path';
import fs from 'fs';
import Moralis from 'moralis';

const MORALIS_API_KEY = '';
// Initialize Moralis
Moralis.start({
  apiKey: MORALIS_API_KEY,
});

export const fetchNFTData = async (
  contractAddress: string,
  pageSize: number = 100
) => {
  let cursor = null;
  let allNFTs: any[] = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await Moralis.EvmApi.nft.getContractNFTs({
        address: contractAddress,
        chain: '0x1',
        format: 'decimal',
        limit: pageSize,
        cursor: cursor || undefined,
        normalizeMetadata: true,
        mediaItems: true,
      });

      if (response.raw.result) {
        allNFTs.push(...(response.raw.result as any[]));
      }

      cursor = response.raw.cursor;
      hasMore = !!cursor;
    }
    return allNFTs;
  } catch (error: any) {
    console.error('Error fetching NFT data:', error.message);
    throw error;
  }
};
export const fetchNFTDataFromJson = async (filePath: string) => {
  try {
    console.log(__dirname);
    const data = await fs.promises.readFile(
      path.resolve('/mounts-data/mounts_data.json'),
      'utf-8'
    );
    const nftDataArray = JSON.parse(data);
    return nftDataArray;
  } catch (error: unknown) {
    console.error(
      'Error fetching NFT data from JSON file:',
      (error as Error).message
    );
    throw error;
  }
};
