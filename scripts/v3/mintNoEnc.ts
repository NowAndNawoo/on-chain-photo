import { ethers } from 'hardhat';
import { getEnvValue, getEnvValueAsNumber, waitTx } from '../lib/common';
import { createUri } from '../lib/createUri';
import { getEIP1559Overrides } from '../lib/overrides';
import { uploadUri } from './lib/uploadUri';

async function main() {
  const contractAddress = getEnvValue('V3_CA');
  const tokenId = getEnvValueAsNumber('V3_ID');

  const splitSize = 24544;
  const overrides = getEIP1559Overrides(1, 0.1); // for Goerli
  // const overrides = getEIP1559Overrides(10, 1); // for Polygon

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV3', contractAddress);
  console.log('contract address:', contract.address);

  // check tokenId
  const exists = await contract.exists(tokenId);
  if (exists) throw Error('tokenId already exists: ' + tokenId);

  // tokens
  const tokens = [
    { tokenId: 9, fileSize: '751kb' },
    { tokenId: 20, fileSize: '751kb' },
  ];

  const token = tokens.find((t) => t.tokenId === tokenId);
  if (token === undefined) throw Error('token not found');
  const tokenInfo = {
    filePath: `./data/${token.fileSize}.jpg`,
    tokenId,
    name: `On-Chain Photo - ${token.fileSize.toUpperCase()}`,
    description:
      'Fully on-chain NFT of JPEG photo image.\n\nOriginal image:  \nhttps://cc0.photo/2015/11/14/colorful-pumpkins/',
  };

  const uri = createUri(tokenInfo, false); // URLエンコードなし
  await uploadUri(contract, tokenId, uri, splitSize, overrides);

  // mint
  const txMint = await contract.mint(tokenId, overrides);
  await waitTx('mint', txMint);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
