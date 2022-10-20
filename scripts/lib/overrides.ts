import { ethers } from 'hardhat';
import { Overrides } from 'ethers';

export function getEIP1559Overrides(maxFeePerGas: number, maxPriorityFeePerGas: number): Overrides {
  return {
    type: 2,
    maxFeePerGas: ethers.utils.parseUnits(maxFeePerGas.toString(), 'gwei'),
    maxPriorityFeePerGas: ethers.utils.parseUnits(maxPriorityFeePerGas.toString(), 'gwei'),
  };
}
