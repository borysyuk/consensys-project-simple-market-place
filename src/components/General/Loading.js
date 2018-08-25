import React, {Component} from 'react';

class Loading extends Component {

    render() {
        console.log('Loading', this.props.isReady);

        return (
            <div>
                {!this.props.isReady &&
                <div className="lds-default">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                }
            </div>
        );
    }
}

export default Loading;