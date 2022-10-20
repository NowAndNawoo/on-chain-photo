import { ethers } from 'hardhat';
import { waitTx } from '../lib/common';

async function main() {
  // check split size
  // (run with '--network localhost')

  const fileSize = 101_000; // JPG file size
  const splitSize = 25_000;

  const [owner] = await ethers.getSigners();
  console.log('owner:', owner.address);

  const factory = await ethers.getContractFactory('OnChainPhotoV1');
  const contract = await factory.deploy();
  await contract.deployed();
  console.log('deployed to:', contract.address);

  const tokenId = 1;
  const name = 'name1';
  const description = 'description1';
  const fileContent = Buffer.from('A'.repeat(fileSize));
  const fileContentBase64 = fileContent.toString('base64');
  const image = 'data:image/jpeg;base64,' + fileContentBase64;
  const metadata = JSON.stringify({ name, description, image });
  const uri = 'data:application/json,' + encodeURIComponent(metadata);
  const data = Buffer.from(uri);

  // appendUri
  const splitCount = Math.ceil(data.length / splitSize);
  console.log({ fileSize: fileSize, dataLength: data.length, splitSize, splitCount });
  for (let i = 0; i < splitCount; i++) {
    const buffer = data.subarray(i * splitSize, (i + 1) * splitSize);
    const tx = await contract.appendUri(tokenId, buffer);
    await waitTx(`appednUri ${i + 1} of ${splitCount}`, tx);
  }

  // mint
  const txMint = await contract.mint(tokenId);
  await waitTx('mint', txMint);

  // tokenURI
  const tokenUri = await contract.tokenURI(tokenId);
  console.log('tokenURI.length:', tokenUri.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
