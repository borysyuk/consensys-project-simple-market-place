const SimpleMarketPlace = artifacts.require('SimpleMarketPlace');
const BigNumber = web3.BigNumber;
const Eth = web3.eth;
const exceptions = require("./helpers/expectThrow");
const events = require("./helpers/expectEvent");

require('chai').use(require('chai-bignumber')(BigNumber)).should();

contract('SimpleMarketPlace', function (accounts) {
    let owner = accounts[0];
    let bob = accounts[1];
    let alice = accounts[2];

    function shouldEqualRoles(result, isOwner, isAdmin, isShopOwner){
        result[0].should.be.equal(isOwner);
        result[1].should.be.equal(isAdmin);
        result[2].should.be.equal(isShopOwner);
    };

    function shouldEqualShop(result, shopId, shopName, shopDescription, shopLogo, shopExists){
        result[1].should.be.bignumber.equal(new BigNumber(shopId));
        result[2].should.be.equal(shopName);
        result[3].should.be.equal(shopDescription);
        result[4].should.be.equal(shopLogo);
        result[5].should.be.equal(shopExists);
    };

    beforeEach(async function (){
        this.simpleMarketPlace = await SimpleMarketPlace.new({ from: owner });
    });

    context('general', async function (){
        it('should exists', async function (){
        });
    });

    context('constructor', async function (){
        it('setup up correct roles for owner', async function() {
            let roles = await this.simpleMarketPlace.getRoles({ from: owner });
            shouldEqualRoles(roles, true, true, false);
        });
    });

    context('addAdmin', async function (){
        it('should add admin role for user account', async function (){
            let roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, false, false);

            await this.simpleMarketPlace.addAdmin(alice, { from: owner });

            roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, true, false);
        });

        it('should raise exception when you try to add admin role without isOwner permission', async function () {
            await exceptions.expectThrow(
                this.simpleMarketPlace.addAdmin(alice, { from: alice }),
                exceptions.errTypes.revert,
                "You cannot add admin role without isOwner permission"
            );
        });

        it('should raise AdminAdded event', async function (){
            await events.inTransaction(
                this.simpleMarketPlace.addAdmin(alice, { from: owner }),
                'AdminAdded',
                {
                    userAddress: alice,
                }
            );
        });
    });

    context('removeAdmin', async function (){
        it('should remove a admin role', async function (){
            await this.simpleMarketPlace.addAdmin(alice, { from: owner });
            let roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, true, false);

            await this.simpleMarketPlace.removeAdmin(alice, { from: owner });
            roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, false, false);
        });

        it('should raise exception when you try to remove admin role without isOwner permission', async function () {
            await exceptions.expectThrow(
                this.simpleMarketPlace.removeAdmin(alice, { from: alice }),
                exceptions.errTypes.revert,
                "You cannot remove admin role without isOwner permission"
            );
        });

        it('should raise AdminRemoved event', async function (){
            await this.simpleMarketPlace.addAdmin(alice, { from: owner });

            await events.inTransaction(
                this.simpleMarketPlace.removeAdmin(alice, { from: owner }),
                'AdminRemoved',
                {
                    userAddress: alice,
                }
            );
        });
    });

    context('addShopOwner', async function (){
        it('should add shopOwner role for user account', async function (){
            let roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, false, false);

            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });

            roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, false, true);
        });

        it('should raise exception when you try to add shopOwner role without isAdmin permission', async function () {
            await exceptions.expectThrow(
                this.simpleMarketPlace.addShopOwner(alice, { from: alice }),
                exceptions.errTypes.revert,
                "You cannot add shopOwner role without isAdmin permission"
            );
        });

        it('should raise ShopOwnerAdded event', async function (){
            await events.inTransaction(
                this.simpleMarketPlace.addShopOwner(alice, { from: owner }),
                'ShopOwnerAdded',
                {
                    userAddress: alice,
                }
            );
        });
    });

    context('removeShopOwner', async function (){
        it('should remove a shopOwner role', async function (){
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            let roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, false, true);

            await this.simpleMarketPlace.removeShopOwner(alice, { from: owner });
            roles = await this.simpleMarketPlace.getRoles({ from: alice });
            shouldEqualRoles(roles, false, false, false);
        });

        it('should raise exception when you try to remove shopOwner role without isAdmin permission', async function () {
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });

            await exceptions.expectThrow(
                this.simpleMarketPlace.removeShopOwner(alice, { from: alice }),
                exceptions.errTypes.revert,
                "You cannot remove shopOwner role without isAdmin permission"
            );
        });

        it('should raise ShopOwnerRemoved event', async function (){
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });

            await events.inTransaction(
                this.simpleMarketPlace.removeShopOwner(alice, { from: owner }),
                'ShopOwnerRemoved',
                {
                    userAddress: alice,
                }
            );
        });
    });

    context('createShop', async function (){
        it('should create shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
        });

        it('should create several shops for one shop owner', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});
        });

        it('should create several shops for diffrent shop owners', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });

            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});

            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: alice});

            let bobShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            let aliceShopsCount = await this.simpleMarketPlace.myShopsCount({from: alice});
            let totalShopsCount = await this.simpleMarketPlace.shopsCount({from: bob});

            bobShopsCount.should.be.bignumber.equal(new BigNumber(2));
            aliceShopsCount.should.be.bignumber.equal(new BigNumber(1));
            totalShopsCount.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should raise exception when you try create shop without isShopOwner permission', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await exceptions.expectThrow(
                this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: alice}),
                exceptions.errTypes.revert,
                "You cannot create shop without isShopOwner permission"
            );
        });

        it('should raise ShopCreated event', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });

            await events.inTransaction(
                this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob}),
                'ShopCreated',
                {
                    shopOwner: bob,
                    shopId: new BigNumber(1),
                    shopName: 'F & D',
                    shopDescription: 'Foods & Drinks',
                    shopLogo: 'logo1.jpg'
                }
            );
        });
    });

    context('removeShop', async function (){
        it('it should remove shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});

            await this.simpleMarketPlace.removeShop(1, {from: bob});

            let bobShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            let totalShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            bobShopsCount.should.be.bignumber.equal(new BigNumber(0));
            totalShopsCount.should.be.bignumber.equal(new BigNumber(0));
        });

        it('it should remove several shops', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});

            await this.simpleMarketPlace.removeShop(1, {from: bob});
            await this.simpleMarketPlace.removeShop(2, {from: bob});

            let bobShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            let totalShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            bobShopsCount.should.be.bignumber.equal(new BigNumber(0));
            totalShopsCount.should.be.bignumber.equal(new BigNumber(0));
        });

        it('it should remove several shops of diffrent shop owners', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: alice});

            await this.simpleMarketPlace.removeShop(1, {from: bob});
            await this.simpleMarketPlace.removeShop(3, {from: alice});

            let bobShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            let aliceShopsCount = await this.simpleMarketPlace.myShopsCount({from: alice});
            let totalShopsCount = await this.simpleMarketPlace.myShopsCount({from: bob});
            bobShopsCount.should.be.bignumber.equal(new BigNumber(1));
            aliceShopsCount.should.be.bignumber.equal(new BigNumber(0));
            totalShopsCount.should.be.bignumber.equal(new BigNumber(1));
        });

        it('should raise exception when you try remove shop without isShopOwner permission', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.removeShopOwner(bob, { from: owner });

            await exceptions.expectThrow(
                this.simpleMarketPlace.removeShop(1, {from: bob}),
                exceptions.errTypes.revert,
                "You cannot remove shop without isShopOwner permission"
            );
        });

        it('should raise exception when you try remove shop of diffrent shopOwner', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.removeShop(1, {from: alice}),
                exceptions.errTypes.revert,
                "You cannot remove  shop of diffrent shop owner"
            );
        });

        it('should raise ShopRemoved event', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});

            await events.inTransaction(
                this.simpleMarketPlace.removeShop(1, {from: bob}),
                'ShopRemoved',
                {
                    shopOwner: bob,
                    shopId: new BigNumber(1),
                }
            );
        });
    });


    context('getMyNextShop', async function (){
        it('should raise exception when you try to get next own shop in empty list', async function (){
            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Your shop list is empty"
            );
        });

        it('should raise exception when you try to get next own shop in your empty list', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Your shop list is empty"
            );
        });

        it('should returns your first shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});

            let result = await this.simpleMarketPlace.getMyNextShop(0, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);

            result = await this.simpleMarketPlace.getMyNextShop(0, {from: alice});
            shouldEqualShop(result, 2, 'C & M', 'Cars & Motos', 'logo2.jpg', true);
        });

        it('should returns your next shops', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            result = await this.simpleMarketPlace.getMyNextShop(0, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);

            result = await this.simpleMarketPlace.getMyNextShop(1, {from: bob});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);
        });

        it('should raise exception when you try to get your next shop after last one', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(2, { from: bob }),
                exceptions.errTypes.revert,
                "End of your shop list"
            );

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(1, { from: alice }),
                exceptions.errTypes.revert,
                "End of your shop list"
            );

        });

        it('should raise exception when you try to get your next shop from unexisting id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(5, { from: bob }),
                exceptions.errTypes.revert,
                "You cannot get your next shop from unexisting id"
            );
        });

        it('should raise exception when you try to get your next shop from other user shop id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(2, { from: bob }),
                exceptions.errTypes.revert,
                "You cannot get your next shop from other user shop id"
            );
        });

        it('should keep an order in next direction when you delete some of your shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await this.simpleMarketPlace.removeShop(2, {from: bob});
            result = await this.simpleMarketPlace.getMyNextShop(1, {from: bob});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);
        });
    });

    context('getMyPrevShop', async function (){
        it('should raise exception when you try to get your prev shop in empty list', async function (){
            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyPrevShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Shop list is empty"
            );
        });

        it('should raise exception when you try to get prev shop in your empty list', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyPrevShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Your shop list is empty"
            );
        });

        it('should return first shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.getMyPrevShop(3, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);
        });

        it('should return last shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.getMyPrevShop(0, {from: bob});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);

            result = await this.simpleMarketPlace.getMyPrevShop(0, {from: alice});
            shouldEqualShop(result, 2, 'C & M', 'Cars & Motos', 'logo2.jpg', true);
        });

        it('should return your prev shops', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C2 & M2', 'Cars2 & Motos2', 'logo22.jpg', {from: alice});

            let result = await this.simpleMarketPlace.getMyPrevShop(3, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);

            result = await this.simpleMarketPlace.getMyPrevShop(4, {from: alice});
            shouldEqualShop(result, 2, 'C & M', 'Cars & Motos', 'logo2.jpg', true);
        });

        it('should raise exception when you try to get your prev shop from first id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyPrevShop(1, { from: bob }),
                exceptions.errTypes.revert,
                "End of your shop list"
            );

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyPrevShop(2, { from: alice }),
                exceptions.errTypes.revert,
                "End of your shop list"
            );
        });

        it('should raise exception when you try to get your prev shop from unexisting id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyPrevShop(5, { from: bob }),
                exceptions.errTypes.revert,
                "You cannot get your prev shop from unexisting id"
            );
        });

        it('should raise exception when you try to get your prev shop from other user shop id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyPrevShop(2, { from: bob }),
                exceptions.errTypes.revert,
                "You cannot get your prev shop from other user shop id"
            );
        });

        it('should keep an order in prev direction when you delete some shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});


            await this.simpleMarketPlace.removeShop(2, { from: bob });

            let result = await this.simpleMarketPlace.getMyPrevShop(3, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);
        });
    });

    context('myShopsCount', async function (){
        it('should return zero for empty my shop catalog', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });

            let result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should return correct count of shops', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.myShopsCount({from: alice});
            result.should.be.bignumber.equal(new BigNumber(1));
            result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(2));
        });

        it('should increase count of shops when you add new shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });

            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            let result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            result = await this.simpleMarketPlace.myShopsCount({from: alice});
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(2));
        });

        it('should decrease count of shops when you remove some shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.simpleMarketPlace.removeShop(1, {from: bob});
            result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleMarketPlace.removeShop(2, {from: alice});
            result = await this.simpleMarketPlace.myShopsCount({from: alice});
            result.should.be.bignumber.equal(new BigNumber(0));

            await this.simpleMarketPlace.removeShop(3, {from: bob});
            result = await this.simpleMarketPlace.myShopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });

    context('getNextShop', async function (){
        it('should raise exception when you try to get next shop in empty list', async function (){
            await exceptions.expectThrow(
                this.simpleMarketPlace.getNextShop(0),
                exceptions.errTypes.revert,
                "Shop list is empty"
            );
        });

        it('should returns first shop for any user', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});

            let result = await this.simpleMarketPlace.getNextShop(0, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);

            result = await this.simpleMarketPlace.getNextShop(0, {from: alice});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);
        });

        it('should returns next shops for any users', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            result = await this.simpleMarketPlace.getNextShop(0, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);

            result = await this.simpleMarketPlace.getNextShop(1, {from: bob});
            shouldEqualShop(result, 2, 'C & M', 'Cars & Motos', 'logo2.jpg', true);
        });

        it('should raise exception when you try to get next shop after last one for any users', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getNextShop(3, { from: bob }),
                exceptions.errTypes.revert,
                "End of shop list"
            );

            await exceptions.expectThrow(
                this.simpleMarketPlace.getMyNextShop(3, { from: alice }),
                exceptions.errTypes.revert,
                "End of shop list"
            );

        });

        it('should raise exception when you try to get next shop from unexisting id for any users', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getNextShop(5, { from: bob }),
                exceptions.errTypes.revert,
                "You cannot get next shop from unexisting id"
            );

            await exceptions.expectThrow(
                this.simpleMarketPlace.getNextShop(5, { from: owner }),
                exceptions.errTypes.revert,
                "You cannot get next shop from unexisting id"
            );
        });

        it('should keep an order in next direction when you delete some of shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await this.simpleMarketPlace.removeShop(2, {from: bob});
            result = await this.simpleMarketPlace.getNextShop(1, {from: bob});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);
        });
    });

    context('getPrevShop', async function (){
        it('should raise exception when you try to get prev shop in empty list', async function (){
            await exceptions.expectThrow(
                this.simpleMarketPlace.getPrevShop(0, { from: owner }),
                exceptions.errTypes.revert,
                "Shop list is empty"
            );
        });

        it('should return first shop for any users', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.getPrevShop(3, {from: bob});
            shouldEqualShop(result, 2, 'C & M', 'Cars & Motos', 'logo2.jpg', true);
        });

        it('should return last shop for any users', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.getPrevShop(0, {from: bob});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);

            result = await this.simpleMarketPlace.getPrevShop(0, {from: alice});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);
        });

        it('should return your prev shops for any users', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C2 & M2', 'Cars2 & Motos2', 'logo22.jpg', {from: alice});

            let result = await this.simpleMarketPlace.getPrevShop(3, {from: bob});
            shouldEqualShop(result, 2, 'C & M', 'Cars & Motos', 'logo2.jpg', true);

            result = await this.simpleMarketPlace.getPrevShop(4, {from: alice});
            shouldEqualShop(result, 3, 'C & G', 'Computers & Games', 'logo3.jpg', true);
        });

        it('should raise exception when you try to get your prev shop from first id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getPrevShop(1, { from: bob }),
                exceptions.errTypes.revert,
                "End of your shop list"
            );

            await exceptions.expectThrow(
                this.simpleMarketPlace.getPrevShop(1, { from: alice }),
                exceptions.errTypes.revert,
                "End of your shop list"
            );
        });

        it('should raise exception when you try to get your prev shop from unexisting id', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            await exceptions.expectThrow(
                this.simpleMarketPlace.getPrevShop(5, { from: bob }),
                exceptions.errTypes.revert,
                "You cannot get your prev shop from unexisting id"
            );
        });

        it('should keep an order in prev direction when you delete some shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});


            await this.simpleMarketPlace.removeShop(2, { from: bob });

            let result = await this.simpleMarketPlace.getPrevShop(3, {from: bob});
            shouldEqualShop(result, 1, 'F & D', 'Foods & Drinks', 'logo1.jpg', true);
        });
    });

    context('shopsCount', async function (){
        it('should return zero for empty shop catalog', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });

            let result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(0));
        });

        it('should return correct count of shops', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.shopsCount({from: alice});
            result.should.be.bignumber.equal(new BigNumber(3));
            result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should increase count of shops when shop owner adds new shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });

            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            let result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            result = await this.simpleMarketPlace.shopsCount({from: alice});
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});
            result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(3));
        });

        it('should decrease count of shops when shop owner removes some shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.addShopOwner(alice, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});
            await this.simpleMarketPlace.createShop('C & M', 'Cars & Motos', 'logo2.jpg', {from: alice});
            await this.simpleMarketPlace.createShop('C & G', 'Computers & Games', 'logo3.jpg', {from: bob});

            let result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(3));

            await this.simpleMarketPlace.removeShop(1, {from: bob});
            result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(2));

            await this.simpleMarketPlace.removeShop(2, {from: alice});
            result = await this.simpleMarketPlace.shopsCount({from: alice});
            result.should.be.bignumber.equal(new BigNumber(1));

            await this.simpleMarketPlace.removeShop(3, {from: bob});
            result = await this.simpleMarketPlace.shopsCount({from: bob});
            result.should.be.bignumber.equal(new BigNumber(0));
        });
    });

    context('getRoles', async function (){
        it('should return roles for any user', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });

            let result = await this.simpleMarketPlace.getRoles({from: owner});
            shouldEqualRoles(result, true, true, false);

            result = await this.simpleMarketPlace.getRoles({from: alice});
            shouldEqualRoles(result, false, false, false);

            result = await this.simpleMarketPlace.getRoles({from: bob});
            shouldEqualRoles(result, false, false, true);
        });
    });

    context('isAdmin', async function (){
        it('should return true when user has admin role', async function (){
            let result = await this.simpleMarketPlace.isAdmin(owner);
            result.should.be.equal(true);
        });

        it('should return true when user has NOT admin role', async function (){
            let result = await this.simpleMarketPlace.isAdmin(bob);
            result.should.be.equal(false);
        });
    });

    context('isShopOwner', async function (){
        it('should return true when user has ShopOwner role', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });

            let result = await this.simpleMarketPlace.isShopOwner(bob);
            result.should.be.equal(true);
        });

        it('should return true when user has NOT ShopOwner role', async function (){
            let result = await this.simpleMarketPlace.isShopOwner(owner);
            result.should.be.equal(false);
        });
    });

    context('isShopCreatedByUser', async function (){
        it('should return true when user create this shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});

            let shop = await this.simpleMarketPlace.getNextShop(0);
            let result = await this.simpleMarketPlace.isShopCreatedByUser(shop[0], bob);
            result.should.be.equal(true);
        });

        it('should return false when user did NOT create this shop', async function (){
            await this.simpleMarketPlace.addShopOwner(bob, { from: owner });
            await this.simpleMarketPlace.createShop('F & D', 'Foods & Drinks', 'logo1.jpg', {from: bob});

            let shop = await this.simpleMarketPlace.getNextShop(0);
            let result = await this.simpleMarketPlace.isShopCreatedByUser(shop[0], alice);
            result.should.be.equal(false);
        });
    });
});
