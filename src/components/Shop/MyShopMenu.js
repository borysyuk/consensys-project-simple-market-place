import React, {Component} from 'react';
import {Link} from 'react-router-dom'

class MyShopMenu extends Component {

    render() {
        console.log(this.props);
        return (
            <div className="my-shop-menu">
                {/*<Link to={'/shop/'+this.props.address+'/edit'}><button className="pure-button button-success">Edit Info</button></Link>*/}
                {/*&nbsp;*/}
                <Link to={'/shop/' + this.props.address}>
                    <button className="pure-button pure-button-primary">Show Products</button>
                </Link>
                &nbsp;
                {this.props.isOwner &&
                <span>
                    <Link to={'/shop/' + this.props.address + '/add-product'}>
                        <button className="pure-button button-secondary">Add Product</button>
                    </Link>
                    &nbsp;
                    <Link to={'/shop/' + this.props.address + '/withdraw'}>
                        <button className="pure-button button-warning">Withdraw</button>
                    </Link>
                </span>
                }
            </div>
        )
    }
}

export default MyShopMenu;