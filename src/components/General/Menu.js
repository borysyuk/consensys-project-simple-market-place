import React, {Component} from 'react';
import { Link } from 'react-router-dom'

class Menu extends Component {

    render() {
        return (
            <nav className="navbar pure-menu pure-menu-horizontal">
                <Link to='/' className="pure-menu-heading pure-menu-link">All Shops</Link>
                { this.props.roles.isShopOwner && <Link to='/my-shops' className="pure-menu-heading pure-menu-link">My Shops</Link> }
                { this.props.roles.isAdmin && <Link to='/shop-owners' className="pure-menu-heading pure-menu-link">Manage shop owners</Link> }
                { this.props.roles.isMarketOwner && <Link to='/admins' className="pure-menu-heading pure-menu-link">Manage admins</Link> }
            </nav>
        )
    }
}

export default Menu;