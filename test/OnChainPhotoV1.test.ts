import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { ethers } from 'hardhat';
import { createUri } from '../scripts/lib/createUri';
import { uploadUri } from '../scripts/v1/mint';

describe('OnChainPhotoV1', function () {
  async function fixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const contract = await ethers
      .getContractFactory('OnChainPhotoV1')
      .then((factory) => factory.deploy())
      .then((contract) => contract.deployed());
    return { contract, owner, user1, user2 };
  }

  describe('基本', function () {
    it('deployできる', async function () {
      await loadFixture(fixture);
    });
    it('name&symbolが正しい', async function () {
      const { contract } = await loadFixture(fixture);
      expect(await contract.name()).equal('OnChainPhotoV1');
      expect(await contract.symbol()).equal('OCP1');
    });
  });

  describe('mint', function () {
    it('ownerはmintできる', async function () {
      const { contract, owner } = await loadFixture(fixture);
      await contract.mint(1);
      expect(await contract.ownerOf(1)).equal(owner.address);
    });
    it('同じtokenIdはmintできない', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.mint(1);
      await expect(contract.mint(1)).reverted;
    });
    it('mintするとtokenURIが取得できる', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.mint(1);
      expect(await contract.tokenURI(1)).equal('');
    });
    it('mintしていないtokenURIは取得できない', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.mint(1);
      await expect(contract.tokenURI(2)).reverted;
    });
    it('mintはonlyOwner', async function () {
      const { contract, user1 } = await loadFixture(fixture);
      await expect(contract.connect(user1).mint(1)).reverted;
    });
  });

  describe('exists', function () {
    it('mintするとexistsがtrueに変わる', async function () {
      const { contract } = await loadFixture(fixture);
      expect(await contract.exists(1)).false;
      await contract.mint(1);
      expect(await contract.exists(1)).true;
    });
  });

  describe('appendUri', function () {
    it('appendUriでuriを設定できる', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await contract.mint(1);
      expect(await contract.tokenURI(1)).equal('hello');
    });
    it('appendUriを複数回使うとuriが追記される', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await contract.appendUri(1, Buffer.from('world'));
      await contract.mint(1);
      expect(await contract.tokenURI(1)).equal('helloworld');
    });
    it('appendUriはonlyOwner', async function () {
      const { contract, user1 } = await loadFixture(fixture);
      await expect(contract.connect(user1).appendUri(1, Buffer.from('hello'))).reverted;
    });
  });

  describe('clearUri', function () {
    it('clearUriするとuriが消去される', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await contract.clearUri(1);
      await contract.mint(1);
      expect(await contract.tokenURI(1)).equal('');
    });
    it('clearUriはonlyOwner', async function () {
      const { contract, user1 } = await loadFixture(fixture);
      await expect(contract.connect(user1).clearUri(1)).reverted;
    });
  });

  describe('freeze', function () {
    it('uriが未設定だとfreezeできない', async function () {
      const { contract } = await loadFixture(fixture);
      await expect(contract.freeze(1)).reverted;
    });
    it('freezeするとappendUriできない', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await contract.freeze(1);
      await expect(contract.appendUri(1, Buffer.from('world'))).reverted;
    });
    it('freezeするとclearUriできない', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await contract.freeze(1);
      await expect(contract.clearUri(1)).reverted;
    });
    it('freezeするとfreezeできない', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await contract.freeze(1);
      await expect(contract.freeze(1)).reverted;
    });
    it('freezeするとisFrozenがtrueに変わる', async function () {
      const { contract } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      expect(await contract.isFrozen(1)).false;
      await contract.freeze(1);
      expect(await contract.isFrozen(1)).true;
    });
    it('freezeはonlyOwner', async function () {
      const { contract, user1 } = await loadFixture(fixture);
      await contract.appendUri(1, Buffer.from('hello'));
      await expect(contract.connect(user1).freeze(1)).reverted;
    });
  });

  // describe.skip('createUri,uploadUri', function () {
  //   it('metadataが正しい', async function () {
  //     const tokenInfo = { filePath: './test/data/10kb.jpg', tokenId: 1, name: 'token1', description: 'description1' };
  //     const { contract } = await loadFixture(fixture);
  //     const uri1 = createUri(tokenInfo, true);
  //     await uploadUri(contract, tokenInfo.tokenId, uri1, 14000);
  //     await contract.mint(tokenInfo.tokenId);
  //     const uri2 = await contract.tokenURI(tokenInfo.tokenId);
  //     const metadata = JSON.parse(decodeURIComponent(uri2.split(',')[1])); //TODO: "data:application/json,"の後を取得
  //     expect(metadata.name).equal(tokenInfo.name);
  //     expect(metadata.description).equal(tokenInfo.description);
  //     const image = Buffer.from(metadata.image.split(',')[1], 'base64'); // TODO: "data:image/jpg;base64,"の後を取得
  //     const original = readFileSync(tokenInfo.filePath);
  //     expect(original.compare(image)).equal(0);
  //   });
  // });
});
