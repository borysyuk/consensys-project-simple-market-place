import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import StorageService from "../../services/StorageService";
import {NotificationManager} from 'react-notifications';


class RemoveShopOwner extends Component {
    constructor(props) {
        super(props);

        this.state = {address: ''};

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleRemoveShopOwner = this.handleRemoveShopOwner.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value});
    }

    handleRemoveShopOwner(event) {
        event.preventDefault();
        console.log(this.state.address);
        SimpleMarketPlaceService.removeShopOwner(this.state.address).then(result => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.setState({address: ''});
        }).catch(error => {
            NotificationManager.error('Cannot remove ShopOwner.', '', 5000);
        });
    }

    initWatchers() {
        this.RemoveWatcher = StorageService.simpleMarketPlaceContract.ShopOwnerRemoved({});
        this.RemoveWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('ShopOwner removed');
                if (this.props.handlerRolesChanged) {
                    this.props.handlerRolesChanged();
                }
            } else {
                NotificationManager.error('Cannot remove ShopOwner');
            }
        });
    }

    stopWatchers() {
        this.RemoveWatcher.stopWatching();
    }

    componentWillMount() {
        this.initWatchers()
    }

    componentWillUnmount() {
        this.stopWatchers();
    }

    render() {
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    Remove owner : &nbsp;
                    <form className="pure-form">
                        <fieldset>
                            <input className="address" type="text" placeholder="Shop owner address"
                                   onChange={this.handleChangeAddress} value={this.state.address}/>&nbsp;&nbsp;
                            <button type="submit" className="button-error pure-button"
                                    onClick={this.handleRemoveShopOwner}>Remove
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default RemoveShopOwner;