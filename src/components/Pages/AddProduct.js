import React, {Component} from 'react';
import IpfsService from '../../services/IpfsService';
import SimpleShopService from "../../services/SimpleShopService";
import Loading from "../General/Loading";
import Image from "../General/Image";
import {NotificationManager} from 'react-notifications';
import StorageService from "../../services/StorageService";


class AddProduct extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: (this.props.id ? this.props.id : 0),
            name: (this.props.name ? this.props.name : ''),
            price: (this.props.price ? this.props.price : 1),
            quantity: (this.props.quantity ? this.props.quantity : 0),
            image: (this.props.image ? this.props.image : ''),

            buttonName: (this.props.id ? 'Update' : 'Add'),
            title: (this.props.id ? 'Update' : 'Add new'),
            isReady: true,
            uploadImageIsReady: true
        };

        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangePrice = this.handleChangePrice.bind(this);
        this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
        this.handleChangeImage = this.handleChangeImage.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);

        this.handleAddProduct = this.handleAddProduct.bind(this);
        this.handleUpdateProduct = this.handleUpdateProduct.bind(this);

        this.handleProduct = (this.props.id ? this.handleUpdateProduct : this.handleAddProduct);
    }

    handleChangeName(event) {
        this.setState({name: event.target.value});
    }

    handleChangePrice(event) {
        this.setState({price: event.target.value});
    }

    handleChangeQuantity(event) {
        this.setState({quantity: event.target.value});
    }

    handleChangeImage(event) {
        this.setState({image: event.target.value});
    }

    handleUploadImage(event) {
        const file = event.target.files[0];
        this.setState({
            uploadImageIsReady: false,
            image: ''
        });

        NotificationManager.info('Please wait, IPFS uploading is still in progress....', '', 5000);
        IpfsService.upload(file, console.log).then((url) => {
            NotificationManager.success('IPFS uploading - done!', '', 5000);
            this.setState({
                image: url,
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

    handleAddProduct(event) {
        event.preventDefault();
        this.setState({isReady: false});
        SimpleShopService.addProduct(this.state.name, this.state.price, this.state.quantity, this.state.image)
            .then(result => {
                NotificationManager.info('Please wait for confirmation.', '', 5000);
                this.setState({
                    isReady: true,
                    name: '',
                    price: 1,
                    quantity: 0,
                    image: ''
                });
            })
            .catch(error => {
                console.log('Cannot create a product', error);
            });
    }

    handleUpdateProduct(event) {
        event.preventDefault();
        this.setState({isReady: false});
        SimpleShopService.updateProduct(this.state.id, this.state.name, this.state.price, this.state.quantity, this.state.image)
            .then(result => {
                NotificationManager.info('Please wait for confirmation.', '', 5000);
                this.setState({
                    isReady: true,
                });
            })
            .catch(error => {
                console.log('Cannot update a product', error);
            });
    }

    initWatchers() {
        this.CreateWatcher = StorageService.simpleShopContract.ProductAdded({});
        this.CreateWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Product has been added!');
            } else {
                NotificationManager.error('Cannot add a product.');
            }
        });
        this.UpdateWatcher = StorageService.simpleShopContract.ProductUpdated({});
        this.UpdateWatcher.watch((error, result) => {
            if (!error) {
                NotificationManager.success('Product has been updated!');
            } else {
                NotificationManager.error('Cannot update a product.');
            }
        });

    }

    stopWatchers() {
        this.CreateWatcher.stopWatching();
        this.UpdateWatcher.stopWatching();
    }

    componentWillMount() {
        this.initWatchers();
        if (this.state.id) {
            this.setState({isReady: false});
            SimpleShopService.getProduct(this.state.id).then(product => {
                console.log('Get product', product);
                this.setState({
                    isReady: true,
                    ...product
                });
            });
        }
    }

    componentWillUnmount() {
        this.stopWatchers();
    }

    render() {
        return (
            <div>
                <div className="pure-g">
                    <div className='pure-u-1-1'>
                        <h2>{this.state.title} Product</h2>
                        <form className="pure-form pure-form-stacked">
                            <fieldset>
                                <div className="pure-g">
                                    <div className='pure-u-1-4'>
                                        <label htmlFor="email">Name</label>
                                        <input id="name" type="text" placeholder="Name" onChange={this.handleChangeName}
                                               value={this.state.name}/>

                                        <label htmlFor="email">Price (Eth)</label>
                                        <input id="price" type="text" placeholder="Price"
                                               onChange={this.handleChangePrice}
                                               value={this.state.price}/>

                                        <label htmlFor="email">Quantity</label>
                                        <input id="quantity" type="text" placeholder="Quantity"
                                               onChange={this.handleChangeQuantity} value={this.state.quantity}/>
                                    </div>

                                    <div className='pure-u-3-4'>
                                        <label htmlFor="password">Image URL <small>(copy absolutely URL with
                                            http/https)</small></label>
                                        <input id="image" type="text" placeholder="Image URL"
                                               onChange={this.handleChangeImage}
                                               value={this.state.image}/>

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
                                        <Image url={this.state.image} width={150} height={150} title={this.state.name}/>
                                    </div>
                                </div>
                                <button type="submit" className="button-success pure-button"
                                        disabled={!this.state.isReady}
                                        onClick={this.handleProduct}>{this.state.buttonName}</button>
                            </fieldset>
                        </form>
                    </div>
                </div>
                <
                    Loading
                    isReady={this.state.isReady
                    }
                />
            </div>
        )
    }
}

export default AddProduct;