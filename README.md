# On-Chain Photo

## Setup

```shell
git clone https://github.com/NowAndNawoo/on-chain-photo.git
cd on-chain-photo
npm ci
cp .env.sample .env
```

.env に必要事項を記載してください。

## Deploy

```shell
npx hardhat run scripts/v3/deploy.ts --network goerli
```

`deployed to:`の後にコントラクトアドレスが表示されます。

## Mint

tokenID=1 をミントする場合

`V3_CA=`にコントラクトアドレス、`V3_ID=`に tokenID を指定して以下のコマンドを実行してください。

```shell
V3_CA=(コントラクトアドレス) V3_ID=(tokenID) npx hardhat run scripts/v3/mint.ts --network goerli
```

```shell
// tokenID=1をミントする例
V3_CA=0x5FbDB2315678afecb367f032d93F642f64180aa3 V3_ID=1 npx hardhat run scripts/v3/mintProd.ts --network goerli
```

## バージョンの違い

### On-Chain Photo V1

- ストレージにデータを保存(sstore)

### On-Chain Photo V2

- SSTORE2 を使用
- bytes.concat でデータ結合

### On-Chain Photo V3

- SSTORE2 を使用
- Memory.sol でデータ結合
