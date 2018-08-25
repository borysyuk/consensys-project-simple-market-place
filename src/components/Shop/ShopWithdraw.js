import React, {Component} from 'react';
import StorageService from "../../services/StorageService";
import SimpleShopService from "../../services/SimpleShopService";
import Loading from "../General/Loading";
import {NotificationManager} from 'react-notifications';

class ShopWithdraw extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            funds: 0,
            shopBalance: 0,
            isReady: false
        };

        this.handleChangeFunds = this.handleChangeFunds.bind(this);
        this.handleWithdraw = this.handleWithdraw.bind(this)
    }

    handleChangeFunds(event) {
        this.setState({funds: event.target.value});
    }

    handleWithdraw(event) {
        event.preventDefault();

        return SimpleShopService.withdraw(this.state.funds).then(result => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            console.log("Withdraw done", result);
            this.initShop();
        }).catch(error => {
            console.log("Withdraw error", error);
        });
    }

    initShop() {
        this.setState({
            isReady: false,
        });

        let address = this.props.address;
        SimpleShopService.initSimpleShopContract(address).then(simpleShopContract => {
            StorageService.set('simpleShopContract', simpleShopContract);
            Promise.all([
                SimpleShopService.getShopBalance(address)
            ]).then(results => {
                console.log(results);
                this.setState({
                    isReady: true,
                    shopBalance: results[0],
                });
            });
        });
    }

    initWatchers() {
        // this.CreateWatcher = StorageService.simpleShopContract.ProductAdded({});
        // this.CreateWatcher.watch((error, result) => {
        //     if (!error) {
        //         NotificationManager.success('Funds have been withdrawn!');
        //         this.initShop();
        //     } else {
        //         NotificationManager.error('Cannot withdraw a funds.');
        //     }
        // });

        this.BuyWatcher = StorageService.simpleShopContract.ProductBought({});
        this.BuyWatcher.watch((error, result) => {
            console.log(result);
            console.log(error);
            if (!error) {
                this.initShop();
            }
        });

    }

    stopWatchers() {
//        this.CreateWatcher.stopWatching();
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
                <h2>Withdraw</h2>
                {this.state.isReady &&
                <form className="pure-form pure-form-stacked">
                    <b>Shop balance : </b> <span>{this.state.shopBalance}</span> eth<br/><br/>
                    <fieldset>
                        <label htmlFor="email">Funds (Eth)</label>
                        <input id="funds" type="text" placeholder="Funds" onChange={this.handleChangeFunds}
                               value={this.state.funds}/>

                        <button className="button-secondary pure-button"
                                disabled={!this.state.isReady} onClick={this.handleWithdraw}>Withdraw
                        </button>
                    </fieldset>
                </form>
                }
                <Loading isReady={this.state.isReady}/>
            </div>
        )
    }
}

export default ShopWithdraw;
