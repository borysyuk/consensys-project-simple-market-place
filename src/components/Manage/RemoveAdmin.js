import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import {NotificationManager} from 'react-notifications';
import StorageService from "../../services/StorageService";

class RemoveAdmin extends Component {
    constructor(props) {
        super(props);

        this.state = {address: ''};

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleRemoveAdmin = this.handleRemoveAdmin.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value});
    }

    handleRemoveAdmin(event) {
        event.preventDefault();
        console.log(this.state.address);
        SimpleMarketPlaceService.removeAdmin(this.state.address).then(result => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.setState({address: ''});
        }).catch(error => {
            NotificationManager.error('Cannot remove admin.', '', 5000);
        });
    }

    initWatchers() {
        this.RemoveWatcher = StorageService.simpleMarketPlaceContract.AdminRemoved({});
        this.RemoveWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Admin removed');
                if (this.props.handlerRolesChanged) {
                    this.props.handlerRolesChanged();
                }
            } else {
                NotificationManager.error('Cannot Remove admin');
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
                    Remove admin : &nbsp;
                    <form className="pure-form">
                        <fieldset>
                            <input className="address" type="text" placeholder="Admin address"
                                   onChange={this.handleChangeAddress} value={this.state.address}/>&nbsp;&nbsp;
                            <button type="submit" className="button-error pure-button"
                                    onClick={this.handleRemoveAdmin}>Remove
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default RemoveAdmin;