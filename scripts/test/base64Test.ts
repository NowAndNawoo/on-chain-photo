import { ethers } from 'hardhat';
import { splitData } from '../lib/splitData';
import { waitTx } from '../lib/common';
import { Base64Test } from '../../typechain-types';

async function uploadUri(contract: Base64Test, data: Buffer) {
  const chunkValues = splitData(data, 24575, 5);
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
  const factory = await ethers.getContractFactory('Base64Test');
  const contract = await factory.deploy();
  await contract.deployed();

  const dataSize = 200_000;

  const data = Buffer.from('A'.repeat(dataSize));
  await uploadUri(contract, data);

  const gas1 = await contract.estimateGas.getFullData();
  const gas2 = await contract.estimateGas.base64encode();
  const s = await contract.base64encode();
  console.log(`dataSize=${dataSize}, encodedSize=${s.length}, gas1=${gas1.toNumber()}, gas2=${gas2.toNumber()}`);

  // dataSize=200000, encodedSize=266668, gas1=3068228, gas2=19507735
  // dataSize=250000, encodedSize=333336, gas1=4041917, gas2=24895727
  // dataSize=290000, encodedSize=386668, gas1=4879112, gas2=29352226
  // dataSize=300000, HttpProviderError

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
