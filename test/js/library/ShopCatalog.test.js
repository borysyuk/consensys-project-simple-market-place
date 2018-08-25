const ShopCatalog = artifacts.require('ShopCatalogMock');
const BigNumber = web3.BigNumber;
const exceptions = require("../helpers/expectThrow");

require('chai').use(require('chai-bignumber')(BigNumber)).should();

contract('ShopCatalog', function ([_, owner]) {

    let shopContract1 = '0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5';
    let shopContract2 = '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc';
    let shopContract3 = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';

    function shouldEqualShop(result, id, contractAddress, exists){
        result[0].should.be.bignumber.equal(new BigNumber(id));
        result[1].should.be.equal(contractAddress);
        result[2].should.be.equal(exists);
    };

    beforeEach(async function (){
        this.mock = await ShopCatalog.new({ from: owner });
    });

    context('general', async function (){
        it('should exists', async function (){
        });
    });

    context('add shop', async function (){
        it('should add a shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should add several shops', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });
            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });
    });

    context('remove shop', async function (){
        it('should remove a shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.remove(1);
            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should remove several shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });
            await this.mock.remove(1);
            await this.mock.remove(2);
            await this.mock.remove(3);
            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should raise exception when you try to remove unexisting shop', async function () {
            await this.mock.add(shopContract1, { from: owner });
            await exceptions.expectThrow(
                this.mock.remove(2, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot remove not existing shop"
            );

            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });
    });

    context('get shop', async function (){

        it('get added shop', async function (){
            await this.mock.add(shopContract1, { from: owner });

            let result = await this.mock.get(1);
            shouldEqualShop(result, 1, shopContract1, true);
        })

        it('get diffrent shops', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            let result = await this.mock.get(1);
            shouldEqualShop(result, 1, shopContract1, true);

            result = await this.mock.get(3);
            shouldEqualShop(result, 3, shopContract3, true);

            result = await this.mock.get(2);
            shouldEqualShop(result, 2, shopContract2, true);
        });

        it('should raise exception when you try to get unexisting shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await exceptions.expectThrow(
                this.mock.get(3, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get unexisting shop"
            );
        });

        it('should raise exception when you try to get removed shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.remove(1)
            await exceptions.expectThrow(
                this.mock.get(1, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get removed shop"
            );
        });
    });

    context('getNextShop', async function (){
        it('should raise exception when you try get next shop in empty list', async function (){
            await exceptions.expectThrow(
                this.mock.getNextShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Shop list is empty"
            );
        });

        it('should returns first shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });

            result = await this.mock.getNextShop(0);
            shouldEqualShop(result, 1, shopContract1, true);
        });

        it('should returns next shops', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            result = await this.mock.getNextShop(1);
            shouldEqualShop(result, 2, shopContract2, true);

            result = await this.mock.getNextShop(2);
            shouldEqualShop(result, 3, shopContract3, true);
        });

        it('should raise exception when you try get next shop after last one', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            await exceptions.expectThrow(
                this.mock.getNextShop(3, { from: owner }),
                exceptions.errTypes.revert,
                "End of shop list"
            );
        });

        it('should raise exception when you try get next shop from unexisting id', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            await exceptions.expectThrow(
                this.mock.getNextShop(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get next shop from unexisting id"
            );
        });

        it('should keep an order in next direction when you delete some element', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            await this.mock.remove(2);
            result = await this.mock.getNextShop(1);
            shouldEqualShop(result, 3, shopContract3, true);
        });
    });

    context('getPrevShop', async function (){
        it('should raise exception when you try get prev shop in empty list', async function (){
            await exceptions.expectThrow(
                this.mock.getPrevShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Shop list is empty"
            );
        });

        it('should return first shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            let result = await this.mock.getPrevShop(2);
            shouldEqualShop(result, 1, shopContract1, true);
        });

        it('should return last shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });
            let result = await this.mock.getPrevShop(0);
            shouldEqualShop(result, 3, shopContract3, true);
        });

        it('should return prev shops', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });
            let result = await this.mock.getPrevShop(3);
            shouldEqualShop(result, 2, shopContract2, true);
            result = await this.mock.getPrevShop(2);
            shouldEqualShop(result, 1, shopContract1, true);
        });

        it('should raise exception when you try get prev shop from first id', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            await exceptions.expectThrow(
                this.mock.getPrevShop(1, { from: owner }),
                exceptions.errTypes.revert,
                "End of shop list"
            );
        });

        it('should raise exception when you try get prev shop from unexisting id', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            await exceptions.expectThrow(
                this.mock.getPrevShop(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get prev shop from unexisting id"
            );
        });

        it('should keep an order in prev direction when you delete some shop', async function (){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            await this.mock.remove(2, { from: owner });

            let result = await this.mock.getPrevShop(3);
            shouldEqualShop(result, 1, shopContract1, true);
        });
    });

    context('shopsCount', async function (){
        it('should return zero for empty shop catalog', async function(){
            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should return correct count of shops', async function(){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should increase count of shops when you add new shop', async function(){
            await this.mock.add(shopContract1, { from: owner });
            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.mock.add(shopContract2, { from: owner });
            result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.mock.add(shopContract3, { from: owner });
            result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should decrease count of shops when you remove some shop', async function(){
            await this.mock.add(shopContract1, { from: owner });
            await this.mock.add(shopContract2, { from: owner });
            await this.mock.add(shopContract3, { from: owner });

            let result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(3));

            await this.mock.remove(1);
            result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.mock.remove(2);
            result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.mock.remove(3);
            result = await this.mock.shopsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });
});
