import { ethers } from 'hardhat';
import { getEnvValue, getEnvValueAsNumber, waitTx } from '../lib/common';
import { createUri } from '../lib/createUri';
import { getEIP1559Overrides } from '../lib/overrides';
import { uploadUri } from './lib/uploadUri';

async function main() {
  const contractAddress = getEnvValue('V3_CA');
  const tokenId = getEnvValueAsNumber('V3_ID');

  const splitSize = 24544;
  const overrides = getEIP1559Overrides(1, 0.01); // for Goerli

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const contract = await ethers.getContractAt('OnChainPhotoV3', contractAddress);
  console.log('contract address:', contract.address);

  // check tokenId
  const exists = await contract.exists(tokenId);
  if (exists) throw Error('tokenId already exists: ' + tokenId);

  // tokens
  const tokens = [
    { tokenId: 10, fileSize: '10kb' },
    { tokenId: 11, fileSize: '10kb' },
    { tokenId: 12, fileSize: '10kb' },
    { tokenId: 13, fileSize: '10kb' },
    { tokenId: 14, fileSize: '10kb' },
    { tokenId: 15, fileSize: '10kb' },
  ];

  const token = tokens.find((t) => t.tokenId === tokenId);
  if (token === undefined) throw Error('token not found');
  const tokenInfo = {
    filePath: `./data/${token.fileSize}.jpg`,
    tokenId,
    name: `On-Chain Photo V3 - ${token.fileSize.toUpperCase()}`,
    description:
      'Fully on-chain NFT of JPEG file.\n\nOriginal image:  \nhttps://cc0.photo/2015/11/14/colorful-pumpkins/',
  };

  const uri = createUri(tokenInfo, false);
  await uploadUri(contract, tokenId, uri, splitSize, overrides);

  // mint
  const txMint = await contract.mint(tokenId, overrides);
  await waitTx('mint', txMint);

  // tokenURI
  const tokenURI = await contract.tokenURI(tokenId);
  console.log({ tokenURI });

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
