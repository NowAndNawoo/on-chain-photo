import { ethers } from 'hardhat';
import { splitData } from '../lib/splitData';
import { waitTx } from '../lib/common';
import { MemoryTest } from '../../typechain-types';

async function uploadUri(contract: MemoryTest, data: Buffer, splitSize: number) {
  const chunkValues = splitData(data, splitSize, 5);
  let totalGasUsed = 0;
  console.log('chunk count:', chunkValues.length);
  for (let i = 0; i < chunkValues.length; i++) {
    const values = chunkValues[i];
    const txAppend = await contract.appendData(values);
    const gasUsed = await waitTx(`appnendData ${i + 1} of ${chunkValues.length} (size=${values.length})`, txAppend);
    totalGasUsed += gasUsed;
  }
  console.log(`totalGasUsed: ${totalGasUsed}`);
  console.log();
}

async function main() {
  const factory = await ethers.getContractFactory('MemoryTest');
  const contract = await factory.deploy();
  await contract.deployed();

  const dataSize = 1_020_000;
  const splitSize = 24544; //24575;

  const data = Buffer.from('A'.repeat(dataSize));
  await uploadUri(contract, data, splitSize);

  const gas = await contract.estimateGas.getFullData();
  console.log(`dataSize=${dataSize}, splitSize=${splitSize}, gas=${gas.toNumber()}`);

  // dataSize=500000, splitSize=24575, gas=10199225
  // dataSize=700000, splitSize=24575, gas=16671347
  // dataSize=900000, splitSize=24575, gas=24518554
  // dataSize=1000000, splitSize=24575, gas=28957307, totalGasUsed: 225544011
  // dataSize=1000000, splitSize=24544, gas=28946109, totalGasUsed: 225541975
  // dataSize=1020000, splitSize=24544, gas=29876113, totalGasUses: 230034087
  // dataSize=1030000, splitSize=24544, HttpProviderError
  // dataSize=1050000, splitSize=24544, HttpProviderError

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
