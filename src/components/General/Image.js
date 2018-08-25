import React, {Component} from 'react';

class Image extends Component {

    render() {
        return (
            <span>
                {this.props.url !== '' && <img className="pure-img" src={this.props.url} width={this.props.width} height={this.props.height} alt={this.props.title} /> }
                {this.props.url === '' && <img className="pure-img" src='/no-image-available.jpg' width={this.props.width} height={this.props.height} alt={this.props.title}/> }
            </span>

        )
    }
}

export default Image;