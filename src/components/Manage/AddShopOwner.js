import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import {NotificationManager} from 'react-notifications';
import StorageService from "../../services/StorageService";

class AddShopOwner extends Component {
    constructor(props) {
        super(props);

        this.state = {address: ''};

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleAddShopOwner = this.handleAddShopOwner.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value});
    }

    handleAddShopOwner(event) {
        event.preventDefault();
        console.log(this.state.address);
        SimpleMarketPlaceService.addShopOwner(this.state.address).then(result => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.setState({address: ''});
        }).catch(error => {
            NotificationManager.error('Cannot add ShopOwner.', '', 5000);
        });
    }

    initWatchers() {
        this.AddWatcher = StorageService.simpleMarketPlaceContract.ShopOwnerAdded({});
        this.AddWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('ShopOwner added');
                if (this.props.handlerRolesChanged) {
                    this.props.handlerRolesChanged();
                }
            } else {
                NotificationManager.error('Cannot Add ShopOwner');
            }
        });
    }

    stopWatchers() {
        this.AddWatcher.stopWatching();
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
                    Add Shop owner : &nbsp;
                    <form className="pure-form">
                        <fieldset>
                            <input className="address" type="text" placeholder="Shop owner address"
                                   onChange={this.handleChangeAddress} value={this.state.address}/>&nbsp;&nbsp;
                            <button type="submit" className="button-success pure-button"
                                    onClick={this.handleAddShopOwner}>Add
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default AddShopOwner;