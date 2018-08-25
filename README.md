# Online Marketplace

## Description: An online marketplace that operates on the blockchain.

There are a list of stores on a central marketplace where shoppers can purchase
goods posted by the store owners.

The central marketplace is managed by a group of administrators.
Admins allow store owners to add stores to the marketplace. Store owners can
manage their store’s inventory and funds. Shoppers can visit stores and purchase
goods that are in stock using cryptocurrency.

User Stories:
An administrator opens the web app. The web app reads the address and identifies
that the user is an admin, showing them admin only functions, such as managing
store owners. An admin adds an address to the list of approved store owners, so
if the owner of that address logs into the app, they have access to the store
owner functions.

An approved store owner logs into the app. The web app recognizes their address
and identifies them as a store owner. They are shown the store owner functions.
They can create a new storefront that will be displayed on the marketplace.
They can also see the storefronts that they have already created. They can
click on a storefront to manage it. They can add/remove products to the
storefront or change any of the products’ prices. They can also withdraw any
funds that the store has collected from sales.

A shopper logs into the app. The web app does not recognize their address so
they are shown the generic shopper application. From the main page they can
browse all of the storefronts that have been created in the marketplace.
Clicking on a storefront will take them to a product page. They can see a list
of products offered by the store, including their price and quantity. Shoppers
can purchase a product, which will debit their account and send it to the store.
The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

## My Comments
When you setup this project, your account (which you have used to deploy project to chain) 
will get "MarketPlace owner" and "Admin" roles. If you want to create your shop,
you should have "ShopOwner" role. You can add it on "Manage shop owners" page. 
After that, you will see new menu item "My Shops".   

You can add image/logo for shops and products. Please use absolute URL with HTTP or HTTPS.
You can upload image to IPFS and get correct absolute URL. But IPFS is very slow 
when you upload image to this network. Please do not use large images and be 
patient during uploading process :-) 


I have created several libraries for this project to:
+ **List.sol**  Implements iterable two way direction list of ids (uint). You can use it 
everywhere where you need store ids of some entities. You can easy remove any id without any of batch operations.
You can store entities into 
dictionaries but ids of entities in this List. Then, you can iterate your entities.

+ **ProductCatalog.sol** - Implements iterable catalog of products (this library uses List library)     

+ **ShopCatalog.sol** - Implements iterable list of shops (this library uses List library too)

+ **SimpleShopFactory.sol** - This is factory library to create stand alone SimpleShop contracts. 


All Solidity contracts and my libraries have been covered by unit tests. Description of each test you 
can see in `**it("Should....", )**` section in a particular test file. 


I have not implemented any UI form validation procedures and other UI protections from dummies. :-)


## Dependencies
+ nodejs version 7.6 or higher
+  [truffle](https://github.com/trufflesuite/truffle): Truffle framework
+  [ganache-cli](https://github.com/trufflesuite/ganache-cli): a command-line
version of Truffle's blockchain server.
``Important note. You need Ganache CLI v6.1.8 (ganache-core: 2.2.1) or higher.


## Install

```
$  git clone git@github.com:borysyuk/consensys-project-simple-market-place.git SimpleMarketPlace
OR
$  git clone https://github.com/borysyuk/consensys-project-simple-market-place.git SimpleMarketPlace
```

```
$ cd SimpleMarketPlace
$ npm install
```
 Run in another terminal

 ```
 $ ganache-cli
 ```

 copy mnemonic string and save it (to use it in Metamask), you will see something like this  

 ```
  HD Wallet
 ==================
 Mnemonic:      robot hub token outdoor keep monitor jazz shallow limb measure region crack
 ```
 Return to the first terminal where you installed the project

### Compile solidity contracts
```
$ truffle compile
```

### Check that all tests a passed
```
$ truffle test
```

### Deploy contracts to local blockchain
```
$ truffle migrate --reset
```

### Metamask configuration
Open metamask plugin in your browser. Logout from your current account. Click
*Import using account seed phrase*
Use mnemonics you saved before.
Select custom network 127.0.0.1:8545


### Start web server localhost:3000
```
$ npm run start
```

  
## More information

+ [Design pattern decisions](https://github.com/borysyuk/consensys-project-simple-market-place/blob/master/design_pattern_desicions.md)
+ [Avoiding common attacks](https://github.com/borysyuk/consensys-project-simple-market-place/blob/master/avoiding_common_attacks.md)
 
 If you have some question or issues during using or installing this project, please contact with me borysyuk.ihor[at]gmail.com