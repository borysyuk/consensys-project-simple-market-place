const ProductCatalog = artifacts.require('ProductCatalogMock');
const BigNumber = web3.BigNumber;
const exceptions = require("../helpers/expectThrow");

require('chai').use(require('chai-bignumber')(BigNumber)).should();

contract('ProductCatalog', function ([_, owner]) {

    function shouldEqualProduct(result, id, name, price, quantity, image, exists){
        result[0].should.be.bignumber.equal(new BigNumber(id));
        result[1].should.be.equal(name);
        result[2].should.be.bignumber.equal(new BigNumber(price));
        result[3].should.be.bignumber.equal(new BigNumber(quantity));
        result[4].should.be.equal(image);
        result[5].should.be.equal(exists);
    };

    beforeEach(async function (){
        this.mock = await ProductCatalog.new({ from: owner });
    });

    context('general', async function (){
        it('should exists', async function (){
        });
    });

    context('add product', async function (){
        it('should add a product', async function (){
            await this.mock.add('Product1', 1000000, 300, 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', { from: owner });
            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should add several products', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should raise exception when you try to add product with zero price', async function () {
            await exceptions.expectThrow(
                this.mock.add('Product4', 0, 300, '1.jpg', { from: owner }),
                exceptions.errTypes.revert,
                "You cannot add product with zero price"
            );

            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });

    context('remove product', async function (){
        it('should remove a product', async function (){
            await this.mock.add('Product1', 1000000, 300, 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', { from: owner });
            await this.mock.remove(1);
            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should remove several products', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 4000000, 100, '3.jpg', { from: owner });
            await this.mock.remove(1);
            await this.mock.remove(2);
            await this.mock.remove(3);
            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should raise exception when you try to remove unexisting product', async function () {
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.mock.remove(2, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot remove not existing product"
            );

            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));
        });
    });

    context('get product', async function (){

        it('get added product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });

            let result = await this.mock.get(1);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        })

        it('get diffrent products', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            let result = await this.mock.get(1);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);

            result = await this.mock.get(3);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);

            result = await this.mock.get(2);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
        });

        it('should raise exception when you try to get unexisting product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.mock.get(3, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get unexisting product"
            );
        });

        it('should raise exception when you try to get removed product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 100, '2.jpg', { from: owner });
            await this.mock.remove(1)
            await exceptions.expectThrow(
                this.mock.get(1, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get removed product"
            );
        });
    });

    context('update product', async function (){
        it('should update added product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.update(1, 'Product11', 1000001, 301, '11.jpg', { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product11', 1000001, 301, '11.jpg', true);
        });

        it('should update only one product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            await this.mock.update(1, 'Product11', 1000001, 301, '11.jpg', { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product11', 1000001, 301, '11.jpg', true);

            result = await this.mock.get(3);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);

            result = await this.mock.get(2);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
        });

        it('should raise exception when you try to update unexisting product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.mock.update(2, 'Product11', 1000001, 301, '11.jpg', { from: owner }),
                exceptions.errTypes.revert,
                "You cannot update unexisting product"
            );
        });

        it('should raise exception when you try to update product price by zero', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.mock.update(1, 'Product1', 0, 30, '1.jpg', { from: owner }),
                exceptions.errTypes.revert,
                "You cannot update product price by zero"
            );
        });
    });

    context('decQuantity', async function () {
        it('should decrease quantity of product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.decQuantity(1, 10, { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product1', 1000000, 290, '1.jpg', true);
        });

        it('should decrease quantity for one product only', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            await this.mock.decQuantity(1, 10, { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product1', 1000000, 290, '1.jpg', true);

            result = await this.mock.get(3);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);

            result = await this.mock.get(2);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
        });

        it('should decrease quantity of product to zero', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.decQuantity(1, 300, { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product1', 1000000, 0, '1.jpg', true);
        });

        it('should raise exception when you try to decrease quantity to negative value', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await exceptions.expectThrow(
                this.mock.decQuantity(1, 301, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot decrease quantity to negative value"
            );
        });
    });

    context('incQuantity', async function () {
        it('should increase quantity of product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.incQuantity(1, 200, { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product1', 1000000, 500, '1.jpg', true);
        });

        it('should increase quantity for one product only', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            await this.mock.incQuantity(1, 200, { from: owner });

            let result = await this.mock.get(1, { from: owner });
            shouldEqualProduct(result, 1, 'Product1', 1000000, 500, '1.jpg', true);

            result = await this.mock.get(3);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);

            result = await this.mock.get(2);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
        });
    });

    context('getNextProduct', async function (){
        it('should raise exception when you try get next product in empty list', async function (){
            await exceptions.expectThrow(
                this.mock.getNextProduct(0, { from: owner }),
                exceptions.errTypes.revert,
                "Product list is empty"
            );
        });

        it('should returns first product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });

            result = await this.mock.getNextProduct(0);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });

        it('should returns next products', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            result = await this.mock.getNextProduct(1);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);

            result = await this.mock.getNextProduct(2);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);
        });

        it('should raise exception when you try get next product after last one', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.mock.getNextProduct(3, { from: owner }),
                exceptions.errTypes.revert,
                "End of product list"
            );
        });

        it('should raise exception when you try get next product from unexisting id', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.mock.getNextProduct(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get next product from unexisting id"
            );
        });

        it('should keep an order in next direction when you delete some element', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.mock.remove(2);
            result = await this.mock.getNextProduct(1);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);
        });
    });

    context('getPrevProduct', async function (){
        it('should raise exception when you try get prev product in empty list', async function (){
            await exceptions.expectThrow(
                this.mock.getPrevProduct(0, { from: owner }),
                exceptions.errTypes.revert,
                "Product list is empty"
            );
        });

        it('should return first product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            let result = await this.mock.getPrevProduct(2);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });

        it('should return last product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            let result = await this.mock.getPrevProduct(0);
            shouldEqualProduct(result, 3, 'Product3', 3000000, 100, '3.jpg', true);
        });

        it('should return prev products', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            let result = await this.mock.getPrevProduct(3);
            shouldEqualProduct(result, 2, 'Product2', 2000000, 200, '2.jpg', true);
            result = await this.mock.getPrevProduct(2);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });

        it('should raise exception when you try get prev product from first id', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.mock.getPrevProduct(1, { from: owner }),
                exceptions.errTypes.revert,
                "End of product list"
            );
        });

        it('should raise exception when you try get prev product from unexisting id', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            await exceptions.expectThrow(
                this.mock.getPrevProduct(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get prev product from unexisting id"
            );
        });

        it('should keep an order in prev direction when you delete some product', async function (){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            await this.mock.remove(2, { from: owner });

            let result = await this.mock.getPrevProduct(3);
            shouldEqualProduct(result, 1, 'Product1', 1000000, 300, '1.jpg', true);
        });
    });

    context('productsCount', async function (){
        it('should return zero for empty product catalog', async function(){
            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should return correct count of products', async function(){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should increase count of products when you add new product', async function(){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });
            result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should decrease count of products when you remove some product', async function(){
            await this.mock.add('Product1', 1000000, 300, '1.jpg', { from: owner });
            await this.mock.add('Product2', 2000000, 200, '2.jpg', { from: owner });
            await this.mock.add('Product3', 3000000, 100, '3.jpg', { from: owner });

            let result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(3));

            await this.mock.remove(1);
            result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.mock.remove(2);
            result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.mock.remove(3);
            result = await this.mock.productsCount();
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });
});
