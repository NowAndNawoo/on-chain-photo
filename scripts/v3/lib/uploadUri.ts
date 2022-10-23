import { Overrides } from 'ethers';
import { OnChainPhotoV3 } from '../../../typechain-types';
import { waitTx } from '../../lib/common';
import { splitData } from '../../lib/splitData';

export async function uploadUri(
  contract: OnChainPhotoV3,
  tokenId: number,
  uri: string,
  splitSize: number,
  overrides: Overrides | undefined
) {
  const data = Buffer.from(uri);
  const chunkValues = splitData(data, splitSize, 5);
  let totalGasUsed = 0;
  console.log('chunk count:', chunkValues.length);
  for (let i = 0; i < chunkValues.length; i++) {
    const values = chunkValues[i];
    const txAppend = await contract.appendUri(tokenId, values, overrides);
    const gasUsed = await waitTx(`appnendUri ${i + 1} of ${chunkValues.length} (size=${values.length})`, txAppend);
    totalGasUsed += gasUsed;
  }
  console.log(`totalGasUsed: ${totalGasUsed}`);
  console.log();
}
