import React, {Component} from 'react';

class EmptyPage extends Component {
    render() {
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    {this.props.text}
                </div>
            </div>
        )
    }
}

export default EmptyPage;