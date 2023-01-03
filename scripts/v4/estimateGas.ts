import { ethers } from 'hardhat';
import { waitTx } from '../lib/common';
import { uploadUri } from './lib/uploadUri';
import { randomBytes } from 'crypto';

async function main() {
  const factory = await ethers.getContractFactory('OnChainPhotoV4');
  const contract = await factory.deploy();
  await contract.deployed();

  const uriSize = 1_810_000;
  const splitSize = 24575; // 24544;
  const tokenId = 1;

  const uri = 'A'.repeat(uriSize);
  const totalGasUsed = await uploadUri(contract, tokenId, uri, splitSize);
  const txMint = await contract.mint(tokenId);
  await waitTx('mint', txMint);

  const gas = await contract.estimateGas.tokenURI(tokenId);
  console.log(`dataSize=${uriSize}, splitSize=${splitSize}, gas=${gas.toNumber()}, totalGasUsed=${totalGasUsed}`);

  // MemoryTest(v3)
  // dataSize=1020000, splitSize=24544, gas=29876113, totalGasUses: 230034087
  // dataSize=1030000, splitSize=24544, HttpProviderError

  // v4
  // dataSize=1020000, splitSize=24575, gas=10608987, totalGasUsed=229976328
  // dataSize=1500000, splitSize=24575, gas=21090648, totalGasUsed=338236147
  // dataSize=1800000, splitSize=24575, gas=29426633, totalGasUsed=405830960
  // dataSize=1810000, splitSize=24575, gas=29726484, totalGasUsed=408067899
  // dataSize=1820000, splitSize=24575, HttpProviderError (Transaction ran out of gas)
  // dataSize=1850000, splitSize=24575, HttpProviderError (Transaction ran out of gas)
  // dataSize=2000000, splitSize=24575, HttpProviderError (Transaction ran out of gas)

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
