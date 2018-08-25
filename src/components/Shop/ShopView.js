import React, {Component} from 'react';
import StorageService from "../../services/StorageService";
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';

import SimpleShopService from "../../services/SimpleShopService";
import MyShopMenu from "./MyShopMenu";
import {Route, Switch} from "react-router-dom";
import AddProduct from "../Pages/AddProduct";
import EmptyPage from "../Pages/EmptyPage";
import Loading from "../General/Loading";
import ShopProductList from "./ShopProductList";
import ShopWithdraw from "./ShopWithdraw";

class ShopView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            description: '',
            logo: '',
            address: '',
            products: [],
            isOwner: false,
            isReady: false
        };
    }

    initShop() {
        let address = this.props.match.params.address;
        this.setState({
            address: address,
        });

        SimpleShopService.initSimpleShopContract(address).then(simpleShopContract => {
            StorageService.set('simpleShopContract', simpleShopContract);
            Promise.all([
                SimpleMarketPlaceService.isShopCreatedByUser(address, StorageService.web3.eth.defaultAccount),
                SimpleShopService.getShopInfo(),
                SimpleShopService.getProducts(0, 10)
            ]).then(results => {
                console.log(results);
                this.setState({
                    isReady: true,
                    isOwner: results[0],
                    products: results[2],
                    ...results[1],
                });

                console.log(this.state);
            });
        });
    }

    componentWillMount() {
        this.initShop();
    }

    render() {
        return (
            <div>
                {this.state.isReady && <div className="shop-view">
                    <div className="shop-info">
                        <h2>{this.state.name}</h2>
                        <div className="pure-g">
                            <div className="pure-u-1-4">
                                <div className="logo entity"><img className="pure-img" src={this.state.logo} width={200}
                                                                  height={200} alt={this.state.name}/></div>
                            </div>
                            <div className="pure-u-3-4">
                                <div className="shop-name entity"><b>Contract Address: </b>{this.state.address}
                                </div>
                                <div className="shop-description entity">
                                    <b>Description: </b>{this.state.description}</div>
                                <div className="shop-actions entity">
                                    <MyShopMenu isOwner={this.state.isOwner} address={this.state.address}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Switch>
                        {this.state.isOwner &&
                        <Route exact path={`${this.props.match.url}/add-product`} render={(props) => (
                            <AddProduct {...props} address={this.state.address}/>
                        )}/>
                        }

                        {this.state.isOwner &&
                        <Route exact path={`${this.props.match.url}/edit-product/:id`} render={(props) => (
                            <AddProduct {...props} address={this.state.address} id={props.match.params.id}/>
                        )}/>
                        }

                        <Route exact path={`${this.props.match.url}/`} render={(props) => (
                            <ShopProductList address={this.state.address} {...props} />
                        )}/>

                        {this.state.isOwner &&
                        <Route exact path={`${this.props.match.url}/withdraw`} render={(props) => (
                            <ShopWithdraw {...props} address={this.state.address} />
                        )}/>
                        }

                        <Route render={(props) => (
                            <EmptyPage text="Error: 404. Page not found."/>
                        )}/>
                    </Switch>
                </div>
                }
                <Loading isReady={this.state.isReady}/>
            </div>
        )
    }
}

export default ShopView;
