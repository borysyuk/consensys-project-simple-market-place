import React, {Component} from 'react';
import { Switch, Route } from 'react-router-dom'
import {NotificationContainer} from 'react-notifications';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';
import 'react-notifications/lib/notifications.css';

import SimpleMarketPlaceArtifacts from '../build/contracts/SimpleMarketPlace.json';
import getWeb3 from './utils/getWeb3';

import StorageService from './services/StorageService';
import GeneralService from './services/GeneralService';
import SimpleMarketPlaceService from './services/SimpleMarketPlaceService';

import InfoPanel from './components/General/InfoPanel';
import Menu from './components/General/Menu';
import Admins from "./components/Pages/Admins";
import ShopOwners from "./components/Pages/ShopOwners";
import AllShops from "./components/Pages/AllShops";
import CreateShops from "./components/Pages/CreateShop";
import MyShops from "./components/Pages/MyShops";
import ShopView from "./components/Shop/ShopView";
import Loading from "./components/General/Loading";
import EmptyPage from "./components/Pages/EmptyPage";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: null,
            roles: {},
            isReady: false,
            isError: false,
            errorMessage: ''
        }

        this.updateStateRoles = this.updateStateRoles.bind(this);
    }

    componentWillMount() {
        this.initApplication();
        this.InspectAccountChange();
    }

    componentWillUnmount() {
        clearInterval(this.changeAccountIntervalId);
    }

    InspectAccountChange() {
        this.changeAccountIntervalId = setInterval(() => {
            GeneralService.getCurrentAccount().then((newAccount) => {
                if ((newAccount !== this.state.account) && (this.state.account)) {
                    window.location.reload();
                }
            });
        }, 1000);
    }

    displayErrors(errorMessage) {
        this.setState({
            isError: true,
            isReady: true,
            errorMessage: errorMessage
        });
    }

    initWeb3() {
        return getWeb3.then(results => {
            StorageService.set('web3', results.web3);
            return results.web3;
        }).catch(() => {
            this.displayErrors('Error finding web3.');
        })
    }

    updateStateRoles() {
        SimpleMarketPlaceService.getRoles().then(roles => {
            console.log(roles);
            this.setState({
                roles:  {...roles},
            });
        }).catch(error => {
            this.displayErrors(error);
        });
    }

    initApplication() {
        this.initWeb3().then(web3 => {
            console.log('Hello World');
            try {
                const contract = require('truffle-contract');

                let SimpleMarketPlace = contract(SimpleMarketPlaceArtifacts);
                SimpleMarketPlace.setProvider(StorageService.web3.currentProvider);

                Promise.all([
                    SimpleMarketPlace.deployed(),
                    GeneralService.getCurrentAccount()
                ]).then(results => {
                    StorageService.set('simpleMarketPlaceContract', results[0]);
                    web3.eth.defaultAccount = results[1];

                    SimpleMarketPlaceService.getRoles().then(roles => {
                        this.setState({
                            account: results[1],
                            roles:  {...roles},
                            isReady: true
                        });
                    }).catch(error => {
                        this.displayErrors(error);
                    });
                }, reason => {
                    this.displayErrors(reason);
                });
            } catch (e) {
                this.displayErrors(e.message);
            }
        });
    }

    render() {
        return (
            <div className="general-container">
                {this.state.isReady && !this.state.isError &&
                <div className="App">
                    <Menu roles={this.state.roles} />

                    <main className="container">
                        <InfoPanel account={this.state.account} roles={this.state.roles}/>
                        <div className='sub-container'>
                            <Switch>
                                <Route path='/' exact component={AllShops}/>

                                {this.state.roles.isShopOwner && <Route path='/my-shops' exact component={MyShops}/> }

                                {this.state.roles.isMarketOwner && <Route path="/admins" render={(props) => (
                                    <Admins {...props} handlerRolesChanged={this.updateStateRoles}/>
                                )} />}

                                {this.state.roles.isAdmin && <Route path="/shop-owners" exact render={(props) => (
                                    <ShopOwners {...props} handlerRolesChanged={this.updateStateRoles}/>
                                )} />}

                                {this.state.roles.isShopOwner && <Route path='/shop-owners/create-shop' exact component={CreateShops}/>}

                                <Route path="/shop/:address" render={(props) => (
                                    <ShopView {...props}/>
                                )} />

                                <Route render={(props) => (
                                    <EmptyPage text="Error: 404. Page not found."/>
                                )}/>
                            </Switch>
                        </div>
                    </main>
                </div>
                }

                <Loading isReady={this.state.isReady}/>
                <NotificationContainer />

                {this.state.isError &&
                <div className="app-error">
                    {this.state.errorMessage}
                </div>
                }

            </div>
        );
    }
}

export default App
