import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import ShopList from "../Shop/ShopList";
import MyShopsMenu from "../Shop/MyShopsMenu";
import Loading from "../General/Loading";
import {NotificationManager} from 'react-notifications';
import StorageService from "../../services/StorageService";

class MyShops extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            shops: [],
            count: 0,
            shopsPerPage: 10,
            isLoadMoreReady: true
        };

        this.handleRemoveShop = this.handleRemoveShop.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    handleLoadMore() {
        let lastId = this.state.shops[this.state.shops.length - 1].id;

        return Promise.all([
            SimpleMarketPlaceService.getMyShops(lastId, this.state.shopsPerPage),
            SimpleMarketPlaceService.myShopsCount()
        ]).then(results => {
            let mergedShops = [...this.state.shops, ...results[0]];
            this.setState({
                isReady: true,
                shops: mergedShops,
                count: results[1],
            });

            return mergedShops;
        });
    }

    handleRemoveShop(shopId) {
        return () => {
            SimpleMarketPlaceService.removeShop(shopId).then(results => {
                NotificationManager.info('Please wait for confirmation.', '', 5000);
            });
        }
    }

    loadShops(pageSize) {
        return Promise.all([
            SimpleMarketPlaceService.getMyShops(0, pageSize),
            SimpleMarketPlaceService.myShopsCount()
        ]).then(results => {
            console.log('My Shop List:');
            console.log(results);
            this.setState({
                isReady: true,
                shops: results[0],
                count: results[1]
            });
        });
    }

    getIpp() {
        if (this.state.shops.length > this.state.shopsPerPage) {
            return this.state.shops.length;
        } else {
            return this.state.shopsPerPage;
        }
    }

    initWatchers() {
        let reloadShops = (error, result) => {
            if (!error) {
                this.loadShops(this.getIpp());
            }
        };
        this.CreateWatcher = StorageService.simpleMarketPlaceContract.ShopCreated({});
        this.CreateWatcher.watch(reloadShops);

        this.RemoveWatcher = StorageService.simpleMarketPlaceContract.ShopRemoved({});
        this.RemoveWatcher.watch(reloadShops);
    }

    stopWatchers() {
        this.CreateWatcher.stopWatching();
        this.RemoveWatcher.stopWatching();
    }

    componentWillMount() {
        this.initWatchers();
        this.loadShops(this.getIpp());
    }

    componentWillUnmount() {
        this.stopWatchers();
    }

    render() {
        return (
            <div>
                <div className="pure-g">
                    <div className='pure-u-1-1'>
                        <h2>All my shops</h2>
                        <MyShopsMenu/>

                        {this.state.isReady &&
                        <ShopList shops={this.state.shops} isOwner={true} RemoveShopOnClick={this.handleRemoveShop}/>}

                        {this.state.isReady && (this.state.shops.length < this.state.count) &&
                        <button type="submit" className="button-success pure-button"
                                disabled={!this.state.isLoadMoreReady}
                                onClick={this.handleLoadMore}>Show more shops</button>

                        }

                        <Loading isReady={this.state.isReady}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default MyShops;