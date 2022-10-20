import { ethers } from 'hardhat';
import { getEnvValue, waitTx } from '../lib/common';
import { uploadImage } from './lib/uploadImage';

async function main() {
  const contractAddress = getEnvValue('CONTRACT_ADDRESS');

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV1', contractAddress);
  console.log('contract address:', contract.address);

  // upload image
  const tokenInfo = {
    filePath: './data/12kb.jpg',
    tokenId: 1,
    name: 'OnChainPhotoV1 Photo No.1',
    description: `OnChainPhotoV1 12KB`,
  };
  await uploadImage(contract, tokenInfo);

  // mint
  const tx = await contract.mint(tokenInfo.tokenId);
  await waitTx('mint', tx);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
