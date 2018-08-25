const List = artifacts.require('ListMock');
const BigNumber = web3.BigNumber;
const exceptions = require("../helpers/expectThrow");

require('chai').use(require('chai-bignumber')(BigNumber)).should();


contract('List', function ([_, owner]){
    beforeEach(async function (){
        this.mock = await List.new({ from: owner });
    });

    context('general', async function (){
        it('should exists', async function (){
        });
    });


    context('add id', async function (){
        it('should add non zero id', async function (){
            await this.mock.add(5, { from: owner });
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should add several non zero id', async function (){
            await this.mock.add(5, { from: owner });
            await this.mock.add(6, { from: owner });
            await this.mock.add(2, { from: owner });
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should raise exception when you try add zero', async function (){
            await exceptions.expectThrow(
                this.mock.add(0, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot add zero id to list"
            );
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should raise exception when you try add non unique id', async function (){
            await this.mock.add(2, { from: owner }),
            await exceptions.expectThrow(
                this.mock.add(2, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot add non unique id"
            );
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });
    });

    context('remove id', async function (){
        it('should remove non zero id', async function (){
            await this.mock.add(5, { from: owner });
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
            await this.mock.remove(5, { from: owner });
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should remove several non zero id', async function (){
            await this.mock.add(5, { from: owner });
            await this.mock.add(6, { from: owner });
            await this.mock.add(2, { from: owner });
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(3));

            await this.mock.remove(6, { from: owner });
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(2));
            await this.mock.remove(5, { from: owner });
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
            await this.mock.remove(2, { from: owner });
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should remove first id', async function (){
            await this.mock.add(5, { from: owner });
            await this.mock.add(6, { from: owner });
            await this.mock.add(2, { from: owner });

            await this.mock.remove(5, { from: owner });
            let result = await this.mock.getNextId(0);
            result.should.be.bignumber.equal(new BigNumber(6));
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(2));
        });

        it('should remove last id', async function (){
            await this.mock.add(5, { from: owner });
            await this.mock.add(6, { from: owner });
            await this.mock.add(2, { from: owner });

            await this.mock.remove(2, { from: owner });
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await exceptions.expectThrow(
                this.mock.getNextId(6, { from: owner }),
                exceptions.errTypes.revert,
                "It can be end of list!"
            );
        });

        it('should raise exception when you try remove zero', async function (){
            await exceptions.expectThrow(
                this.mock.remove(0, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot remove or add zero id to list"
            );
        });

        it('should raise exception when you try to remove non existing id', async function (){
            await this.mock.add(2, { from: owner }),
            await exceptions.expectThrow(
                this.mock.remove(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot remove non existing id"
            );
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should raise exception when you try to remove already removed id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.remove(2, { from: owner });
            await exceptions.expectThrow(
                this.mock.remove(2, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot remove already removed id"
            );
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });

    context('getNextId', async function (){
        it('should raise exception when you try get next id in empty list', async function (){
            await exceptions.expectThrow(
                this.mock.getNextId(0, { from: owner }),
                exceptions.errTypes.revert,
                "List is empty"
            );
        });

        it('should return first id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            let result = await this.mock.getNextId(0);
            result.should.be.bignumber.equal(new BigNumber(2));
        });

        it('should return next id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });
            let result = await this.mock.getNextId(0);
            result.should.be.bignumber.equal(new BigNumber(2));
            result = await this.mock.getNextId(2);
            result.should.be.bignumber.equal(new BigNumber(3));
            result = await this.mock.getNextId(3);
            result.should.be.bignumber.equal(new BigNumber(4));
        });

        it('should raise exception when you try get next id from last id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });

            await exceptions.expectThrow(
                this.mock.getNextId(4, { from: owner }),
                exceptions.errTypes.revert,
                "End of list"
            );
        });

        it('should raise exception when you try get next id from unexisting id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });

            await exceptions.expectThrow(
                this.mock.getNextId(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get next id from unexisting id"
            );
        });

        it('should keep an order in next direction when you delete some element', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });
            await this.mock.add(5, { from: owner });

            await this.mock.remove(3, { from: owner });

            let result = await this.mock.getNextId(0);
            result.should.be.bignumber.equal(new BigNumber(2));
            result = await this.mock.getNextId(2);
            result.should.be.bignumber.equal(new BigNumber(4));
            result = await this.mock.getNextId(4);
            result.should.be.bignumber.equal(new BigNumber(5));
        });

    });

    context('getPrevId', async function (){
        it('should raise exception when you try get prev id in empty list', async function (){
            await exceptions.expectThrow(
                this.mock.getPrevId(0, { from: owner }),
                exceptions.errTypes.revert,
                "List is empty"
            );
        });

        it('should return first id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            let result = await this.mock.getPrevId(3);
            result.should.be.bignumber.equal(new BigNumber(2));
        });

        it('should return last id', async function (){
            await this.mock.add(1, { from: owner });
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            let result = await this.mock.getPrevId(0);
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should return prev id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });
            let result = await this.mock.getPrevId(4);
            result.should.be.bignumber.equal(new BigNumber(3));
            result = await this.mock.getPrevId(3);
            result.should.be.bignumber.equal(new BigNumber(2));
        });

        it('should raise exception when you try get prev id from first id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });

            await exceptions.expectThrow(
                this.mock.getPrevId(2, { from: owner }),
                exceptions.errTypes.revert,
                "End of list"
            );
        });

        it('should raise exception when you try get prev id from unexisting id', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });

            await exceptions.expectThrow(
                this.mock.getPrevId(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get prev id from unexisting id"
            );
        });

        it('should keep an order in prev direction when you delete some element', async function (){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });
            await this.mock.add(5, { from: owner });

            await this.mock.remove(3, { from: owner });

            let result = await this.mock.getPrevId(5);
            result.should.be.bignumber.equal(new BigNumber(4));
            result = await this.mock.getPrevId(4);
            result.should.be.bignumber.equal(new BigNumber(2));
        });
    });

    context('itemsCount', async function (){
        it('should return zero for empty list', async function(){
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should return correct count of items', async function(){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });

            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should increase count of products when you add new item', async function(){
            await this.mock.add(2, { from: owner });
            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.mock.add(3, { from: owner });
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.mock.add(4, { from: owner });
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should decrease count of items when you remove some item', async function(){
            await this.mock.add(2, { from: owner });
            await this.mock.add(3, { from: owner });
            await this.mock.add(4, { from: owner });

            let result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(3));

            await this.mock.remove(2);
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.mock.remove(4);
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.mock.remove(3);
            result = await this.mock.itemsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });
});
