import React, {Component} from 'react';
import StorageService from "../../services/StorageService";
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';

import ProductList from '../Product/ProductList';
import SimpleShopService from "../../services/SimpleShopService";
import Loading from "../General/Loading";
import {NotificationManager} from 'react-notifications';

class ShopProductList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            products: [],
            count: 0,
            isOwner: false,
            isReady: false,
            isLoadMoreReady: true,
            productsPerPage: 10
        };

        this.handleRemoveProduct = this.handleRemoveProduct.bind(this);
        this.handleBuyProduct = this.handleBuyProduct.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    handleLoadMore() {
        let lastId = this.state.products[this.state.products.length-1].id;

        return Promise.all([
            SimpleShopService.getProducts(lastId, this.state.productsPerPage),
            SimpleShopService.productsCount()
        ]).then(results => {
            let mergedProducts = [...this.state.products, ...results[0]];
            this.setState({
                isReady: true,
                products: mergedProducts,
                count: results[1],
            });

            return mergedProducts;
        });
    }

    handleRemoveProduct(productId) {
        return () => {
            SimpleShopService.removeProduct(productId).then(results => {
                console.log('Product removed!', productId);
                NotificationManager.info('Please wait for confirmation.', '', 5000);
            });
        }
    }

    handleBuyProduct(productId, quantity) {
        return SimpleShopService.buyProduct(productId, quantity).then(results => {
            console.log('Product has been sold!', productId);
            NotificationManager.info('Please wait for confirmation.', '', 5000);
        });
    }

    getIpp() {
        if (this.state.products.length > this.state.productsPerPage) {
            return this.state.products.length;
        } else {
            return this.state.productsPerPage;
        }
    }

    loadProducts(pageSize) {
        this.setState({
            isLoadMoreReady: false
        });
        return Promise.all([
            SimpleShopService.getProducts(0, pageSize),
            SimpleShopService.productsCount()
        ]).then(results => {
            this.setState({
                isLoadMoreReady: true,
                products: results[0],
                count: results[1],
            });

            return results[0];
        });
    }

    initShop() {
        let address = this.props.address;

        SimpleShopService.initSimpleShopContract(address).then(simpleShopContract => {
            StorageService.set('simpleShopContract', simpleShopContract);
            Promise.all([
                SimpleMarketPlaceService.isShopCreatedByUser(address, StorageService.web3.eth.defaultAccount),
                this.loadProducts(this.state.productsPerPage)
            ]).then(results => {
                console.log(results);
                this.setState({
                    isReady: true,
                    isOwner: results[0],
                });

                console.log(this.state);
            });
        });
    }

    initWatchers() {
        let reloadShops = (error, result) => {
            if (!error) {
                this.loadProducts(this.getIpp());
            }
        };
        this.CreateWatcher = StorageService.simpleShopContract.ProductAdded({});
        this.CreateWatcher.watch(reloadShops);

        this.RemoveWatcher = StorageService.simpleShopContract.ProductRemoved({});
        this.RemoveWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Product has been removed!');
                reloadShops();
            }
        });

        this.UpdateWatcher = StorageService.simpleShopContract.ProductUpdated({});
        this.UpdateWatcher.watch(reloadShops);

        this.BuyWatcher = StorageService.simpleShopContract.ProductBought({buyer: StorageService.web3.eth.defaultAccount});
        this.BuyWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Product has been sold!');
                reloadShops();
            }
        });
    }

    stopWatchers() {
        this.CreateWatcher.stopWatching();
        this.RemoveWatcher.stopWatching();
        this.UpdateWatcher.stopWatching();
        this.BuyWatcher.stopWatching();
    }

    componentWillMount() {
        this.initWatchers();
        this.initShop();
    }

    componentWillUnmount() {
        this.stopWatchers();
    }

    render() {
        return (
            <div>
                <div className="shop-product-list">
                    <h2>List of products</h2>
                    {this.state.isReady &&
                    <ProductList
                        products={this.state.products}
                        shopAddress={this.props.address}
                        isOwner={this.state.isOwner}
                        RemoveProductOnClick={this.handleRemoveProduct}
                        BuyProductClick={this.handleBuyProduct}
                    />
                    }
                    {this.state.isReady && (this.state.products.length < this.state.count) && <button type="submit" className="button-success pure-button"
                                                                  disabled={!this.state.isLoadMoreReady}
                                                                  onClick={this.handleLoadMore}>Show more products</button>

                    }
                    <Loading isReady={this.state.isReady}/>
                </div>
            </div>
        )
    }
}

export default ShopProductList;
