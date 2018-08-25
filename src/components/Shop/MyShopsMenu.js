import React, {Component} from 'react';
import { Link } from 'react-router-dom'

class MyShopsMenu extends Component {

    render() {
        return (
            <div className="my-shops-menu">
                <div className="pure-button-group" role="group" aria-label="...">
                    <Link to='/shop-owners/create-shop'><button className="pure-button button-secondary">Create new shop</button></Link>
                </div>
            </div>
        )
    }
}

export default MyShopsMenu;