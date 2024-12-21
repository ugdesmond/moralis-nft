import axios from 'axios';
import path from 'path';
import fs from 'fs';

const MORALIS_API_KEY = '';
export const fetchNFTData = async (
  contractAddress: string,
  pageSize: number = 100
) => {
  let cursor = null;
  let allNFTs: any[] = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const response: { data: { result: any[]; cursor: string | null } } =
        await axios.get(
          `https://deep-index.moralis.io/api/v2/nft/${contractAddress}`,
          {
            headers: { 'X-API-Key': MORALIS_API_KEY },
            params: {
              normalizeMetadata: true,
              media_items: true,
              cursor,
              limit: pageSize,
            },
          }
        );

      const { result, cursor: nextCursor } = response.data;
      allNFTs.push(...result);
      cursor = nextCursor;
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
