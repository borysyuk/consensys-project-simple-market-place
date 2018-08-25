import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';

class IsAdmin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: '',
            result: null
        };

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleIsAdmin = this.handleIsAdmin.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({
            address: event.target.value,
            result: null
        });
    }

    handleIsAdmin(event) {
        event.preventDefault();
        SimpleMarketPlaceService.isAdmin(this.state.address).then(result => {
            this.setState({result: result});
        });
    }

    render() {
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    Check admin role: &nbsp;
                    <form className="pure-form">
                        <fieldset>
                            <input className="address" type="text" placeholder="Admin address"
                                   onChange={this.handleChangeAddress}/>&nbsp;&nbsp;
                            <button type="submit" className="button-secondary pure-button"
                                    onClick={this.handleIsAdmin}>Check
                            </button>

                            {this.state.result === true &&
                            <span className="green">&nbsp;&nbsp;This user has "admin" access!</span>}
                            {this.state.result === false &&
                            <span className="red">&nbsp;&nbsp;This user has NOT "admin" access!</span>}
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default IsAdmin;