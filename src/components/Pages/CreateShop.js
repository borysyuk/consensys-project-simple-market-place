import React, {Component} from 'react';
import IpfsService from '../../services/IpfsService';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';
import Loading from "../General/Loading";
import Image from "../General/Image";
import {NotificationManager} from 'react-notifications';
import StorageService from "../../services/StorageService";


class CreateShop extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            description: '',
            logo: '',
            isReady: true,
            uploadImageIsReady: true
        };

        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeDescription = this.handleChangeDescription.bind(this);
        this.handleChangeLogo = this.handleChangeLogo.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);

        this.handleCreateShop = this.handleCreateShop.bind(this);
    }

    handleChangeName(event) {
        this.setState({name: event.target.value});
    }

    handleChangeDescription(event) {
        this.setState({description: event.target.value});
    }

    handleChangeLogo(event) {
        this.setState({logo: event.target.value});
    }

    handleUploadImage(event) {
        const file = event.target.files[0];
        this.setState({
            uploadImageIsReady: false,
            logo: ''
        });

        NotificationManager.info('Please wait, IPFS uploading is still in progress....', '', 5000);
        IpfsService.upload(file, console.log).then((url) => {
            NotificationManager.success('IPFS uploading - done!', '', 5000);
            this.setState({
                logo: url,
                uploadImageIsReady: true
            });
        }).catch((error) => {
            console.log(error);
            //error happen!
            this.setState({
                uploadImageIsReady: false
            });
        });
    }

    handleCreateShop(event) {
        event.preventDefault();
        this.setState({isReady: false});
        SimpleMarketPlaceService.createShop(this.state.name, this.state.description, this.state.logo)
            .then(result => {
                console.log(result);
                NotificationManager.info('Please wait for confirmation.', '', 5000);
                this.setState({
                    isReady: true,
                    name: '',
                    description: '',
                    logo: '',
                });
            })
            .catch((error) => {
                console.log('Cannot create shop', error);
                this.setState({isReady: true});
            });
    }

    initWatchers() {
        this.CreateWatcher = StorageService.simpleMarketPlaceContract.ShopCreated({});
        this.CreateWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Shop created');
            } else {
                NotificationManager.error('Cannot create shop');
            }
        });
    }

    stopWatchers() {
        this.CreateWatcher.stopWatching();
    }

    componentWillMount() {
        this.initWatchers()
    }

    componentWillUnmount() {
        this.stopWatchers();
    }

    render() {
        return (
            <div>
                <div className="pure-g">
                    <div className='pure-u-1-1'>
                        <h2>Create new shop</h2>
                        <form className="pure-form pure-form-stacked">
                            <fieldset>
                                <div className="pure-g">
                                    <div className='pure-u-1-2'>
                                        <label htmlFor="email">Name</label>
                                        <input id="name" type="text" placeholder="Name" onChange={this.handleChangeName}
                                               value={this.state.name}/>

                                        <label htmlFor="email">Description</label>
                                        <textarea id="description" placeholder="Description" rows="6" cols="40"
                                                  onChange={this.handleChangeDescription}
                                                  value={this.state.description}/>
                                    </div>
                                    <div className='pure-u-1-2'>
                                        <label htmlFor="password">Logo URL</label>
                                        <input id="logo" type="text" placeholder="Logo URL"
                                               onChange={this.handleChangeLogo} value={this.state.logo}/>
                                        <label htmlFor="password">
                                            <small>or upload it to ipfs</small>
                                        </label>
                                        <input
                                            type="file"
                                            name="image"
                                            placeholder="image"
                                            onChange={this.handleUploadImage}
                                        />
                                        {!this.state.uploadImageIsReady &&
                                        <small>Please, wait few seconds, uploading is still in progress...</small>}

                                        <label htmlFor="password">Image preview</label>
                                        <Image url={this.state.logo} width={150} height={150} title={this.state.name}/>
                                    </div>
                                </div>

                                <button type="submit" className="button-success pure-button"
                                        disabled={!this.state.isReady} onClick={this.handleCreateShop}>Create
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
                <Loading isReady={this.state.isReady}/>
            </div>
        )
    }
}

export default CreateShop;