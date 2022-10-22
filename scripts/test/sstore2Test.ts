import { ethers } from 'hardhat';
import { waitTx } from '../lib/common';

async function main() {
  const factory = await ethers.getContractFactory('Sstore2Test');
  const contract = await factory.deploy();
  await contract.deployed();

  const dataSize = 24575;

  const data = Buffer.from('A'.repeat(dataSize));
  const tx = await contract.writeData(data);
  await waitTx('writeData', tx);

  const gas = await contract.estimateGas.readData();
  console.log(`dataSize=${dataSize}, gas=${gas.toNumber()}`);

  // dataSize=24575, gas=89655
  // dataSize=24576, HttpProviderError

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
