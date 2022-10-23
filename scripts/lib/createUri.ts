import { readFileSync } from 'fs';

export type TokenInfo = {
  tokenId: number;
  name: string;
  description: string;
  filePath: string;
};

export function createUri({ name, description, filePath }: TokenInfo, urlEncode: boolean) {
  const fileContent = readFileSync(filePath);
  const fileSize = fileContent.length.toLocaleString() + ' bytes';
  const fileContentBase64 = fileContent.toString('base64');
  const json = JSON.stringify({
    name,
    description,
    attributes: [{ trait_type: 'File size', value: fileSize }],
    image: 'data:image/jpeg;base64,' + fileContentBase64,
  });
  if (urlEncode) return 'data:application/json,' + encodeURIComponent(json);
  else return 'data:application/json,' + json;
}
