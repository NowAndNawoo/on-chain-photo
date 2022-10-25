import { Contract, ContractTransaction } from 'ethers';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

export const getEnvValue = (key: string): string => {
  const value = process.env[key];
  console.log(key + ' is:', value);
  if (value === undefined) throw Error(key + ' is undefined');
  if (value === '') throw Error(key + ' is empty');
  return value;
};

export const getEnvValueAsBoolean = (key: string): boolean => {
  const value = getEnvValue(key);
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw Error(key + ' is invalid');
};

export const getEnvValueAsNumber = (key: string): number => {
  const value = getEnvValue(key);
  const num = Number(value);
  if (Number.isNaN(num)) throw Error(key + ' is invalid');
  return num;
};

export function toGwei(gasPrice: BigNumber | undefined): string {
  if (gasPrice === undefined) return 'undefined';
  return ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei';
}

export const waitDeployed = async (title: string, contract: Contract) => {
  console.log('# Deploy ' + title);
  console.log('contract deploy to:', contract.address);
  console.log('hash:', contract.deployTransaction.hash);
  console.log('gasPrice:', toGwei(contract.deployTransaction.gasPrice));
  await contract.deployed();
  console.log('deployed!');
  console.log();
};

export const waitTx = async (title: string, tx: ContractTransaction) => {
  console.log('# ' + title);
  console.log('hash:', tx.hash);
  console.log('gasPrice:', toGwei(tx.gasPrice));
  console.log('nonce', tx.nonce);
  const receipt = await tx.wait();
  console.log('gasUsed:', receipt.gasUsed.toString());
  console.log('confirmed!');
  console.log();
  return receipt.gasUsed.toNumber();
};

export function showGas(title: string, gas: BigNumber): void {
  console.log(`${title}: gas=${gas.toString()}`);
}
