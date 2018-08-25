import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import ShopList from "../Shop/ShopList";
import Loading from "../General/Loading";
import StorageService from "../../services/StorageService";


class AllShops extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            shops: [],
            count: 0,
            shopsPerPage: 10,
            isLoadMoreReady: true,
        };

        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    handleLoadMore() {
        let lastId = this.state.shops[this.state.shops.length - 1].id;

        return Promise.all([
            SimpleMarketPlaceService.getShops(lastId, this.state.shopsPerPage),
            SimpleMarketPlaceService.shopsCount()
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

    loadShops(pageSize) {
        return Promise.all([
            SimpleMarketPlaceService.getShops(0, pageSize),
            SimpleMarketPlaceService.shopsCount()
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
                        <h2>All shops</h2>
                        {this.state.isReady && <ShopList shops={this.state.shops} isOwner={false}/>}

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

export default AllShops;