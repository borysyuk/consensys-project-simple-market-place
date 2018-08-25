import React, {Component} from 'react';

class InfoPanel extends Component {

    render() {
        return (
            <div className="info-panel">
                <div className="pure-g">
                    <div className="pure-u-1-1">
                        <b>Current account:</b> {this.props.account} <br />
                        <b>Access roles: </b>
                        {this.props.roles.isMarketOwner && <span>Market Place owner, </span>}
                        {this.props.roles.isAdmin && <span>Administrator, </span>}
                        {this.props.roles.isShopOwner && <span>Shops owner, </span>}
                        <span>Regular user</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default InfoPanel;