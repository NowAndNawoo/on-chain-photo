import { ethers } from 'hardhat';
import { OnChainPhotoV2 } from '../../typechain-types';
import { getEnvValue, getEnvValueAsNumber, waitTx } from '../lib/common';
import { createUri } from '../lib/createUri';
import { splitData } from '../lib/uploadData';

async function uploadUri(contract: OnChainPhotoV2, tokenId: number, uri: string, splitSize: number) {
  const data = Buffer.from(uri);
  const chunkValues = splitData(data, splitSize, 5);
  let totalGasUsed = 0;
  console.log('chunk count:', chunkValues.length);
  for (let i = 0; i < chunkValues.length; i++) {
    const values = chunkValues[i];
    const txAppend = await contract.appendUri(tokenId, values);
    const gasUsed = await waitTx(`appnendUri ${i + 1} of ${chunkValues.length} (size=${values.length})`, txAppend);
    totalGasUsed += gasUsed;
  }
  console.log(`totalGasUsed: ${totalGasUsed}`);
  console.log();
}

async function main() {
  const contractAddress = getEnvValue('V2_CA');
  const tokenId = getEnvValueAsNumber('V2_ID');
  const splitSize = 24575;

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV2', contractAddress);
  console.log('contract address:', contract.address);

  // check tokenId
  const exists = await contract.exists(tokenId);
  if (exists) throw Error('tokenId already exists: ' + tokenId);

  // tokens
  const tokens = [
    { tokenId: 1, fileSize: '101kb' },
    { tokenId: 2, fileSize: '199kb' },
    { tokenId: 3, fileSize: '296kb' },
    { tokenId: 4, fileSize: '406kb' },
    { tokenId: 5, fileSize: '498kb' },
    { tokenId: 6, fileSize: '603kb' },
  ];

  const token = tokens.find((t) => t.tokenId === tokenId);
  if (token === undefined) throw Error('token not found');
  const tokenInfo = {
    filePath: `./data/${token.fileSize}.jpg`,
    tokenId,
    name: `On-Chain Photo V2 - ${token.fileSize.toUpperCase()}`,
    description: 'Fully on-chain NFT of jpg photo file.',
  };

  const uri = createUri(tokenInfo);
  await uploadUri(contract, tokenId, uri, splitSize);

  // mint
  const txMint = await contract.mint(tokenId);
  await waitTx('mint', txMint);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
