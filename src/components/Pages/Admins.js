import React, {Component} from 'react';
import AddAdmin from "../Manage/AddAdmin";
import RemoveAdmin from "../Manage/RemoveAdmin";
import IsAdmin from "../Manage/IsAdmin";


class Admins extends Component {
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
                    <h2>Manage admins</h2>
                    <AddAdmin handlerRolesChanged={this.props.handlerRolesChanged}/><br />
                    <RemoveAdmin handlerRolesChanged={this.props.handlerRolesChanged}/><br />
                    <IsAdmin/><br />
                </div>
            </div>
        )
    }
}

export default Admins;