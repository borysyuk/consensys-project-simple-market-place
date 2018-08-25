import React from 'react';
import {Link} from 'react-router-dom'
import Image from "../General/Image";

const ShopListItem = ({shop, isOwner, RemoveShopOnClick}) => (
    <div className="pure-g">
        <div className="pure-u-1-8">
            <div className="logo entity"><Image url={shop.logo} width={100} height={100}
                                              title={shop.name}/></div>
        </div>
        <div className="pure-u-1-8">
            <div className="name entity"><Link to={'/shop/' + shop.address}> {shop.name}</Link></div>
        </div>
        <div className="pure-u-1-2">
            <div className="description entity">{shop.description}</div>
        </div>
        <div className="pure-u-1-4">
            <div className="actions entity">
                {isOwner &&
                <button className="button-error pure-button" onClick={RemoveShopOnClick(shop.id)}>Remove</button>
                }
            </div>
        </div>
    </div>
);

export default ShopListItem;
