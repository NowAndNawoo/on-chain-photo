import { chunk } from 'lodash';

export function splitData(data: Buffer, splitSize: number, chunkSize: number): Buffer[][] {
  const splitCount = Math.ceil(data.length / splitSize);
  const splitedData = [...Array(splitCount)].map((_, i) => data.subarray(i * splitSize, (i + 1) * splitSize));
  return chunk(splitedData, chunkSize);
}
