import { createUri } from '../lib/createUri';

async function main() {
  // tokens
  const tokens = [
    { tokenId: 1, fileSize: '1251kb' },
    { tokenId: 2, fileSize: '1310kb' },
    { tokenId: 3, fileSize: '1357kb' },
  ];

  for (const token of tokens) {
    const tokenInfo = {
      filePath: `./data/${token.fileSize}.jpg`,
      tokenId: token.tokenId,
      name: `On-Chain Photo - ${token.fileSize.toUpperCase()}`,
      description:
        'Fully on-chain NFT of JPEG photo image.\n\nOriginal image:  \nhttps://cc0.photo/2015/11/14/colorful-pumpkins/',
    };

    const uri1 = createUri(tokenInfo, true);
    const uri2 = createUri(tokenInfo, false);
    console.log(`fileSize=${token.fileSize}, urlEncode=true: ${uri1.length}, false: ${uri2.length}`);
  }
  // fileSize=1251kb, urlEncode=true: 1779190, false: 1668708
  // fileSize=1310kb, urlEncode=true: 1865450, false: 1747288
  // fileSize=1357kb, urlEncode=true: 1922878, false: 1809420
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
