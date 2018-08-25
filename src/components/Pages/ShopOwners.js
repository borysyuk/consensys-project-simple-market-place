import React, {Component} from 'react';
import AddShopOwner from "../Manage/AddShopOwner";
import RemoveShopOwner from "../Manage/RemoveShopOwner";
import IsShopOwner from "../Manage/IsShopOwner";

class ManageAdmins extends Component {
    constructor (props){
        super(props);

        this.state = {address: ''};

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({address: event.target.value});
    }

    render() {
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    <h2>Manage shop owners</h2>
                    <AddShopOwner handlerRolesChanged={this.props.handlerRolesChanged}/><br />
                    <RemoveShopOwner handlerRolesChanged={this.props.handlerRolesChanged}/><br />
                    <IsShopOwner/><br />
                </div>
            </div>
        )
    }
}

export default ManageAdmins;