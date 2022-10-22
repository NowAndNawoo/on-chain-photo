import { OnChainPhotoV1 } from '../../../typechain-types';
import { waitTx } from '../../lib/common';
import { readFileSync } from 'fs';

type TokenInfo = {
  filePath: string;
  tokenId: number;
  name: string;
  description: string;
};

export async function uploadImage(
  contract: OnChainPhotoV1,
  { name, description, filePath, tokenId }: TokenInfo,
  splitSize: number
) {
  // URIを作成
  const fileContent = readFileSync(filePath);
  const fileSize = fileContent.length;
  const fileContentBase64 = fileContent.toString('base64');
  const image = 'data:image/jpeg;base64,' + fileContentBase64;
  const metadata = JSON.stringify({ name, description, image });
  const uri = 'data:application/json,' + encodeURIComponent(metadata);
  const data = Buffer.from(uri);

  // 分割アップロード(appendUri)
  const splitCount = Math.ceil(data.length / splitSize);
  console.log({ tokenId, filePath, fileSize, dataLength: data.length, splitSize, splitCount });
  let totalGasUsed = 0;
  for (let i = 0; i < splitCount; i++) {
    const buffer = data.subarray(i * splitSize, (i + 1) * splitSize);
    const tx = await contract.appendUri(tokenId, buffer);
    const gasUsed = await waitTx(`appednUri ${i + 1} of ${splitCount}`, tx);
    totalGasUsed += gasUsed;
  }
  console.log(`totalGasUsed: ${totalGasUsed}`);
  console.log();
}