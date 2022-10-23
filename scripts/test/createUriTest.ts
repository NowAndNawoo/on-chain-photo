import { readFileSync, writeFileSync } from 'fs';

async function main() {
  const dataSize = 724475;

  const name = `On-Chain Photo V3 - 724KB`;
  const description = 'Fully on-chain NFT of jpg photo file.';

  // const fileContent = Buffer.from('A'.repeat(dataSize));
  const fileContent = readFileSync('./data/724kb.jpg');
  const fileContentBase64 = fileContent.toString('base64');
  const image = 'data:image/jpeg;base64,' + fileContentBase64;
  const metadata = JSON.stringify({ name, description, image });
  const uri = 'data:application/json,' + encodeURIComponent(metadata);

  console.log(`data=${dataSize}, base64=${fileContentBase64.length}, metadata=${metadata.length}, uri=${uri.length}`);

  writeFileSync('./output/data.txt', fileContent);
  writeFileSync('./output/base64.txt', fileContentBase64);
  writeFileSync('./output/metadata.txt', metadata);
  writeFileSync('./output/uri.txt', uri);

  console.log('done!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
