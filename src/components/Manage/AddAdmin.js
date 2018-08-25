import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import {NotificationManager} from 'react-notifications';
import StorageService from "../../services/StorageService";


class AddAdmin extends Component {
    constructor(props) {
        super(props);

        this.state = {address: ''};

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleAddAdmin = this.handleAddAdmin.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value});
    }

    handleAddAdmin(event) {
        event.preventDefault();
        console.log(this.state.address);
        SimpleMarketPlaceService.addAdmin(this.state.address).then(result => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.setState({address: ''});
        }).catch(error => {
            NotificationManager.error('Cannot add admin.', '', 5000);
        });
    }

    initWatchers() {
        this.AddWatcher = StorageService.simpleMarketPlaceContract.AdminAdded({});
        this.AddWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Admin added');
                if (this.props.handlerRolesChanged) {
                    this.props.handlerRolesChanged();
                }
            } else {
                NotificationManager.error('Cannot Add admin');
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
                    Add admin : &nbsp;
                    <form className="pure-form">
                        <fieldset>
                            <input className="address" type="text" placeholder="Admin address"
                                   onChange={this.handleChangeAddress} value={this.state.address}/>&nbsp;&nbsp;
                            <button type="submit" className="button-success pure-button"
                                    onClick={this.handleAddAdmin}>Add
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default AddAdmin;