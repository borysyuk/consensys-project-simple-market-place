import React, {Component} from 'react';
import SimpleMarketPlaceService from '../../services/SimpleMarketPlaceService';

class IsShopOwner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: '',
            result: null
        };

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleIsShopOwner = this.handleIsShopOwner.bind(this);
    }

    handleChangeAddress(event) {
        this.setState({
            address: event.target.value,
            result: null
        });
    }

    handleIsShopOwner(event) {
        event.preventDefault();
        SimpleMarketPlaceService.isShopOwner(this.state.address).then(result => {
            this.setState({result: result});
        });
    }

    render() {
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    Check shop owner : &nbsp;
                    <form className="pure-form">
                        <fieldset>
                            <input className="address" type="text" placeholder="Shop owner address"
                                   onChange={this.handleChangeAddress}/>&nbsp;&nbsp;
                            <button type="submit" className="button-secondary pure-button"
                                    onClick={this.handleIsShopOwner}>Check
                            </button>

                            {this.state.result === true &&
                            <span className="green">&nbsp;&nbsp;This user has "shop owner" access!</span>}
                            {this.state.result === false &&
                            <span className="red">&nbsp;&nbsp;This user has NOT "shop owner" access!</span>}
                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default IsShopOwner;