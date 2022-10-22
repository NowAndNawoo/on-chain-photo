import { ethers } from 'hardhat';
import { getEnvValue, getEnvValueAsNumber, waitTx } from '../lib/common';
import { OnChainPhotoV1 } from '../../typechain-types';
import { createUri } from '../lib/createUri';

export async function uploadUri(contract: OnChainPhotoV1, tokenId: number, uri: string, splitSize: number) {
  const data = Buffer.from(uri);
  const splitCount = Math.ceil(data.length / splitSize);
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

async function main() {
  const contractAddress = getEnvValue('V1_CA');
  const tokenId = getEnvValueAsNumber('V1_ID');

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV1', contractAddress);
  console.log('contract address:', contract.address);

  // tokens
  const tokens = [
    { tokenId: 1, fileSize: '51kb', splitSize: 40000 }, // totalGasUsed: 53783333
    { tokenId: 2, fileSize: '101kb', splitSize: 25000 }, // totalGasUsed: 128745004
    { tokenId: 3, fileSize: '199kb', splitSize: 14000 }, // totalGasUsed: 395738933
  ];

  const token = tokens.find((t) => t.tokenId === tokenId);
  if (token === undefined) throw Error('token not found');
  const tokenInfo = {
    filePath: `./data/${token.fileSize}.jpg`,
    tokenId,
    name: `On-Chain Photo V1 - ${token.fileSize.toUpperCase()}`,
    description: 'Fully on-chain NFT of jpg photo file.',
  };
  const uri = createUri(tokenInfo);
  await uploadUri(contract, tokenId, uri, token.splitSize);

  // mint
  const tx = await contract.mint(tokenId);
  await waitTx('mint', tx);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
