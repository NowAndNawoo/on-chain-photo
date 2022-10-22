import { ethers } from 'hardhat';
import { OnChainPhotoV3 } from '../../typechain-types';
import { getEnvValue, getEnvValueAsNumber, waitTx } from '../lib/common';
import { createUri } from '../lib/createUri';
import { getEIP1559Overrides } from '../lib/overrides';
import { splitData } from '../lib/uploadData';

const overrides = getEIP1559Overrides(1, 0.01); // or undefined

async function uploadUri(contract: OnChainPhotoV3, tokenId: number, uri: string, splitSize: number) {
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

async function main() {
  const contractAddress = getEnvValue('V3_CA');
  const tokenId = getEnvValueAsNumber('V3_ID');
  const splitSize = 24544;

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV3', contractAddress);
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
    { tokenId: 7, fileSize: '696kb' },
    { tokenId: 8, fileSize: '724kb' },
  ];

  const token = tokens.find((t) => t.tokenId === tokenId);
  if (token === undefined) throw Error('token not found');
  const tokenInfo = {
    filePath: `./data/${token.fileSize}.jpg`,
    tokenId,
    name: `On-Chain Photo V3 - ${token.fileSize.toUpperCase()}`,
    description: 'Fully on-chain NFT of jpg photo file.',
  };

  const uri = createUri(tokenInfo);
  await uploadUri(contract, tokenId, uri, splitSize);

  // mint
  const txMint = await contract.mint(tokenId, overrides);
  await waitTx('mint', txMint);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
