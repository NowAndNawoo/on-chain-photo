import { ethers } from 'hardhat';
import { getEnvValue, getEnvValueAsNumber, waitTx } from '../lib/common';
import { uploadImage } from './lib/uploadImage';

async function main() {
  const contractAddress = getEnvValue('V1_CA');
  const tokenId = getEnvValueAsNumber('V1_ID');

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV1', contractAddress);
  console.log('contract address:', contract.address);

  // uploadImage
  const tokens = [
    { tokenId: 1, fileSize: '51kb', splitSize: 40000 }, // totalGasUsed: 53783333
    { tokenId: 2, fileSize: '101kb', splitSize: 25000 }, // totalGasUsed: 128745004
    { tokenId: 3, fileSize: '199kb', splitSize: 14000 }, // totalGasUsed: 395738933
  ];
  const token = tokens.find((t) => t.tokenId === tokenId);
  if (token === undefined) throw Error('token not found');
  const tokenInfo = {
    filePath: `./data/${token.fileSize}.jpg`,
    tokenId: token.tokenId,
    name: `OnChainPhotoV1 ${token.fileSize}`,
    description: 'Fully on-chain NFT of jpg photo file.',
  };
  await uploadImage(contract, tokenInfo, token.splitSize);

  // mint
  const tx = await contract.mint(tokenInfo.tokenId);
  await waitTx('mint', tx);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
