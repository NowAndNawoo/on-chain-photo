import { readFileSync } from 'fs';

export type TokenInfo = {
  tokenId: number;
  name: string;
  description: string;
  filePath: string;
};

export function createUri({ name, description, filePath }: TokenInfo) {
  const fileContent = readFileSync(filePath);
  const fileContentBase64 = fileContent.toString('base64');
  const image = 'data:image/jpeg;base64,' + fileContentBase64;
  const metadata = JSON.stringify({ name, description, image });
  return 'data:application/json,' + encodeURIComponent(metadata); // URLエンコード
}

function escapeJsonValue(s: string): string {
  return JSON.stringify({ s }).slice(6, -2); // '{"s":"'〜'"}'
}

// URLエンコードしない
export function createUri2({ name, description, filePath }: TokenInfo) {
  const fileContent = readFileSync(filePath);
  const fileContentBase64 = fileContent.toString('base64');
  const image = 'data:image/jpeg;base64,' + fileContentBase64;
  name = escapeJsonValue(name);
  description = escapeJsonValue(description);
  const metadata = JSON.stringify({ name, description, image });
  return 'data:application/json,' + metadata;
}
