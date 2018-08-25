const SimpleShop = artifacts.require('SimpleShop');
const BigNumber = web3.BigNumber;
const Eth = web3.eth;
const exceptions = require("./helpers/expectThrow");
const events = require("./helpers/expectEvent");

require('chai').use(require('chai-bignumber')(BigNumber)).should();

contract('SimpleShop', function (accounts) {
    let owner = accounts[0];
    let bob = accounts[1];
    let alice = accounts[2];

    function shouldEqualProduct(result, id, name, price, quantity, image, exists){
        result[0].should.be.bignumber.equal(new BigNumber(id));
        result[1].should.be.equal(name);
        result[2].should.be.bignumber.equal(new BigNumber(price));
        result[3].should.be.bignumber.equal(new BigNumber(quantity));
        result[4].should.be.equal(image);
        result[5].should.be.equal(exists);
    };

    beforeEach(async function (){
        this.simpleShop = await SimpleShop.new('TestName', 'Test Description', 'logo.jpg', { from: owner });
    });

    context('general', async function (){
        it('should exists', async function (){
        });
    });

    context('updateShopInfo', async function (){
        it('should update shop info', async function() {
            await this.simpleShop.updateShopInfo('Name2','Description2', 'logo2.jpg', { from: owner });
            let name = await this.simpleShop.name();
            name.should.be.equal('Name2');
            let description = await this.simpleShop.description();
            description.should.be.equal('Description2');
            let logo = await this.simpleShop.logo();
            logo.should.be.equal('logo2.jpg');
        });

        it('should raise exception when not owner try to updateShopInfo', async function () {
            await exceptions.expectThrow(
                this.simpleShop.updateShopInfo('Name3', 'Desc3', 'logo3.jpg', { from: bob }),
                exceptions.errTypes.revert,
                "Nobody except owner can  update shop info"
            );
        });
    });

    context('addProduct', async function (){
        it('should add product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should add several products', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });
            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should raise exception when you try to add product with zero price', async function () {
            await exceptions.expectThrow(
                this.simpleShop.addProduct('Product4', 0, 300, '1.jpg', { from: owner }),
                exceptions.errTypes.revert,
                "You cannot addProduct product with zero price"
            );

            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should raise exception when not owner try to add product', async function () {
            await exceptions.expectThrow(
                this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: bob }),
                exceptions.errTypes.revert,
                "Nobody except owner can  add product"
            );

            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should raise ProductAdded event', async function (){
            await events.inTransaction(
                this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner }),
                'ProductAdded',
                {
                    shopOwner: owner,
                    id: new BigNumber(1),
                    name: 'Product1',
                    price: new BigNumber(1000000),
                    quantity: new BigNumber(300),
                    image: '1.jpg'
                }
            );
        });
    });

    context('removeProduct', async function (){
        it('should remove a product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', { from: owner });
            await this.simpleShop.removeProduct(1);
            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should remove several products', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 4000000, 100, '3.jpg', { from: owner });
            await this.simpleShop.removeProduct(1);
            await this.simpleShop.removeProduct(2);
            await this.simpleShop.removeProduct(3);
            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should raise exception when you try to remove unexisting product', async function () {
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.simpleShop.removeProduct(2, { from: owner }),
                exceptions.errTypes.revert,
                "Nobody except owner can remove product"
            );

            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should raise ProductRemoved event', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await events.inTransaction(
                this.simpleShop.removeProduct(1, {from: owner}),
                'ProductRemoved',
                {
                    shopOwner: owner,
                    id: web3.toBigNumber(1),
                }
            );
        });
    });

    context('getProduct', async function (){
        it('get added product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });

            let result = await this.simpleShop.getProduct(1);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        })

        it('get diffrent products', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            let result = await this.simpleShop.getProduct(1);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);

            result = await this.simpleShop.getProduct(3);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);

            result = await this.simpleShop.getProduct(2);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
        });

        it('should raise exception when you try to get unexisting product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.simpleShop.getProduct(3, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get unexisting product"
            );
        });

        it('should raise exception when you try to get removed product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 100, '2.jpg', { from: owner });
            await this.simpleShop.removeProduct(1)
            await exceptions.expectThrow(
                this.simpleShop.getProduct(1, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get removed product"
            );
        });
    });

    context('updateProduct', async function (){
        it('should update added product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.updateProduct(1, 'Product11', 1000001, 301, '11.jpg', { from: owner });

            let result = await this.simpleShop.getProduct(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product11', 1000001, 301, '11.jpg', true);
        });

        it('should update only one product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });
            await this.simpleShop.updateProduct(1, 'Product11', 1000001, 301, '11.jpg', { from: owner });

            let result = await this.simpleShop.getProduct(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product11', 1000001, 301, '11.jpg', true);

            result = await this.simpleShop.getProduct(3);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);

            result = await this.simpleShop.getProduct(2);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
        });

        it('should raise exception when you try to update unexisting product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.simpleShop.updateProduct(2, 'Product11', 1000001, 301, '11.jpg', { from: owner }),
                exceptions.errTypes.revert,
                "You cannot update unexisting product"
            );
        });

        it('should raise exception when you try to update product price by zero', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.simpleShop.updateProduct(1, 'Product1', 0, 30, '1.jpg', { from: owner }),
                exceptions.errTypes.revert,
                "You cannot update product price by zero"
            );
        });

        it('should raise exception when not owner try to update product', async function () {
            this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner }),
            await exceptions.expectThrow(
                this.simpleShop.updateProduct(1, 'Product11', 1000001, 301, '11.jpg', { from: bob }),
                exceptions.errTypes.revert,
                "Nobody except owner can update product"
            );
        });

        it('should raise ProductUpdated event', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await events.inTransaction(
                this.simpleShop.updateProduct(1, 'Product11', 1000001, 301, '11.jpg', { from: owner }),
                'ProductUpdated',
                {
                    shopOwner: owner,
                    id: web3.toBigNumber(1),
                    name: 'Product11',
                    price: new BigNumber(1000001),
                    quantity: new BigNumber(301),
                    image: '11.jpg'
                }
            );
        });
    });

    context('getNextProduct', async function (){
        it('should raise exception when you try get next product in empty list', async function (){
            await exceptions.expectThrow(
                this.simpleShop.getNextProduct(0, { from: owner }),
                exceptions.errTypes.revert,
                "Product list is empty"
            );
        });

        it('should returns first product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });

            result = await this.simpleShop.getNextProduct(0);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });

        it('should returns next products', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            result = await this.simpleShop.getNextProduct(1);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);

            result = await this.simpleShop.getNextProduct(2);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);
        });

        it('should raise exception when you try get next product after last one', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.simpleShop.getNextProduct(3, { from: owner }),
                exceptions.errTypes.revert,
                "End of product list"
            );
        });

        it('should raise exception when you try get next product from unexisting id', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.simpleShop.getNextProduct(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get next product from unexisting id"
            );
        });

        it('should keep an order in next direction when you delete some element', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.simpleShop.removeProduct(2);
            result = await this.simpleShop.getNextProduct(1);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);
        });
    });

    context('getPrevProduct', async function (){
        it('should raise exception when you try get prev product in empty list', async function (){
            await exceptions.expectThrow(
                this.simpleShop.getPrevProduct(0, { from: owner }),
                exceptions.errTypes.revert,
                "Product list is empty"
            );
        });

        it('should return first product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            let result = await this.simpleShop.getPrevProduct(2);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });

        it('should return last product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });
            let result = await this.simpleShop.getPrevProduct(0);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);
        });

        it('should return prev products', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });
            let result = await this.simpleShop.getPrevProduct(3);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
            result = await this.simpleShop.getPrevProduct(2);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });

        it('should raise exception when you try get prev product from first id', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.simpleShop.getPrevProduct(1, { from: owner }),
                exceptions.errTypes.revert,
                "End of product list"
            );
        });

        it('should raise exception when you try get prev product from unexisting id', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.simpleShop.getPrevProduct(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get prev product from unexisting id"
            );
        });

        it('should keep an order in prev direction when you delete some product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.simpleShop.removeProduct(2, { from: owner });

            let result = await this.simpleShop.getPrevProduct(3);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });
    });

    context('productsCount', async function (){
        it('should return zero for empty product catalog', async function (){
            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should return correct count of products', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should increase count of products when you add new product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });
            result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should decrease count of products when you remove some product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            let result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));

            await this.simpleShop.removeProduct(1);
            result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.simpleShop.removeProduct(2);
            result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleShop.removeProduct(3);
            result = await this.simpleShop.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });

    context('buyProduct', async function (){
        it('should sold product', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.simpleShop.buyProduct(2, 10, {from: alice, value: web3.toWei(0.05, 'ether') * 10});

            let endShopBalance = Eth.getBalance(this.simpleShop.address);
            endShopBalance.should.be.bignumber.equal(new BigNumber(web3.toWei(0.5, 'ether')));

            let result = await this.simpleShop.getProduct(2);
            result[3].should.be.bignumber.equal(new BigNumber(190));
        });

        it('should raise event ProductBought', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await events.inTransaction(
                this.simpleShop.buyProduct(2, 10, {from: alice, value: web3.toWei(0.05, 'ether') * 10}),
                'ProductBought',
                {
                    buyer: alice,
                    funds: new BigNumber(web3.toWei(0.05 * 10, 'ether')),
                    id: new BigNumber(2),
                    quantity: new BigNumber(10)
                }
            );
        });

        it('should raise error when user send not enough funds', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.simpleShop.buyProduct(2, 10, {from: alice, value: web3.toWei(0.05, 'ether') * 9}),
                exceptions.errTypes.revert,
                "Not enought funds"
            );
        });

        it('should return exta money', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            let startAliceBalance = Eth.getBalance(alice);
            await this.simpleShop.buyProduct(2, 10, {from: alice, value: web3.toWei(0.05 * 20, 'ether')});
            let endAliceBalance = Eth.getBalance(alice);
            let deltaAliceBalance = startAliceBalance - endAliceBalance;
            let gasAliceUsage = deltaAliceBalance - web3.toWei(0.5, 'ether');

            Number(web3.fromWei(1.0*deltaAliceBalance)).should.be.above(0.5);
            Number(gasAliceUsage).should.be.below(Number(web3.toWei(0.01, 'ether')));

            let endShopBalance = Eth.getBalance(this.simpleShop.address);
            endShopBalance.should.be.bignumber.equal(new BigNumber(web3.toWei(0.5, 'ether')));
        });

        it('should raise event ExtraFundsReturned', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await events.inTransaction(
                await this.simpleShop.buyProduct(2, 10, {from: alice, value: web3.toWei(0.05 * 30, 'ether')}),
                'ExtraFundsReturned',
                {
                    buyer: alice,
                    extraFunds: new BigNumber(web3.toWei(0.05 * 20, 'ether')),
                    id: new BigNumber(2),
                    quantity: new BigNumber(10)
                }
            );
        });

        it('should raise error when user try to buy more quantity of product than exists in shop', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.1, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.simpleShop.buyProduct(2, 210, {from: alice, value: web3.toWei(0.1, 'ether')*210}),
                exceptions.errTypes.revert,
                "Quantity or product is not enough"
            );
        });

        it('should raise error when user try to buy product when shop has been paused', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.simpleShop.pause();
            await exceptions.expectThrow(
                this.simpleShop.buyProduct(2, 10, {from: alice, value: web3.toWei(0.05, 'ether') * 10}),
                exceptions.errTypes.revert,
                "Shop has been paused"
            );
        });
    });

    context('withdraw', async function (){
        it('should withdraw funds', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.simpleShop.buyProduct(2, 40, {from: alice, value: web3.toWei(0.05 * 40, 'ether')});

            let startOwnerBalance = Number(web3.fromWei(Eth.getBalance(owner)));
            await this.simpleShop.withdraw(web3.toWei(1.5, 'ether'), { from: owner });

            let endShopBalance = Number(web3.fromWei(Eth.getBalance(this.simpleShop.address)));
            let endOwnerBalance = Number(web3.fromWei(Eth.getBalance(owner)));

            let deltaOwnerBalance = endOwnerBalance - startOwnerBalance;

            deltaOwnerBalance.should.be.below(1.5);
            (deltaOwnerBalance + 0.01).should.be.above(1.5);

            endShopBalance.should.be.equal(0.5);
        });

        it('should raise error when you try to withdraw too much funds', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });
            await this.simpleShop.buyProduct(2, 40, {from: alice, value: web3.toWei(0.05 * 40, 'ether')});

            await exceptions.expectThrow(
                this.simpleShop.withdraw(web3.toWei(2.5, 'ether'), { from: owner }),
                exceptions.errTypes.revert,
                "Not enough funds"
            );
        });

        it('should raise error when somebody except owner try to withdraw funds', async function (){
            await this.simpleShop.addProduct('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.simpleShop.addProduct('Product2', web3.toWei(0.05, 'ether'), 200, '2.jpg', { from: owner });
            await this.simpleShop.addProduct('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.simpleShop.buyProduct(2, 40, {from: alice, value: web3.toWei(0.05 * 40, 'ether')});

            await exceptions.expectThrow(
                this.simpleShop.withdraw(web3.toWei(0.5, 'ether'), { from: bob }),
                exceptions.errTypes.revert,
                "Only owner can withdraw funds"
            );
        });
    });

    context('getShopInfo', async function (){
        it('should get shop info after create shop', async function (){
            let results = await this.simpleShop.getShopInfo({from: owner});
            results[0].should.be.equal('TestName');
            results[1].should.be.equal('Test Description');
            results[2].should.be.equal('logo.jpg');
        });

        it('should get shop info after update shop info', async function (){
            await this.simpleShop.updateShopInfo('Name2','Description2', 'logo2.jpg', { from: owner });

            let results = await this.simpleShop.getShopInfo({from: owner});
            results[0].should.be.equal('Name2');
            results[1].should.be.equal('Description2');
            results[2].should.be.equal('logo2.jpg');
        });
    });

    context('isOwner', function (){
        it('should return true for owner', async function (){
            let result = await this.simpleShop.isOwner(owner);
            result.should.be.equal(true);
        });

        it('should return false for other users', async function (){
            let result = await this.simpleShop.isOwner(alice);
            result.should.be.equal(false);
        });
    });
});
