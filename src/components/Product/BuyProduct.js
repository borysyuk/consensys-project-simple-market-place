import React, {Component} from 'react';

class BuyProduct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            productId: this.props.productId,
            quantity: 1,
            isReady: true
        }
        this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
        this.handleBuyProduct = this.handleBuyProduct.bind(this);

    }

    handleChangeQuantity(event) {
        this.setState({quantity: event.target.value});
    }

    handleBuyProduct(event) {
        this.setState({isReady: false});
        return this.props.onClick(this.state.productId, this.state.quantity)
            .then(result => {
                this.setState({isReady: true});
            })
            .catch(error => {
                this.setState({isReady: true});
            });
    }


    render() {
        return (
            <form className="pure-form">
                <input className="buy-quantity" type="text" placeholder="Quantity" value={this.state.quantity}
                       onChange={this.handleChangeQuantity}/>&nbsp;
                <button disabled={!this.state.isReady} className="button-success pure-button" onClick={this.handleBuyProduct}>Buy now</button>
            </form>
        );
    }
}

export default BuyProduct;
