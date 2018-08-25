import React from 'react';
import {Link} from 'react-router-dom'

import BuyProduct from './BuyProduct';
import Image from "../General/Image";

const ProductListItem = ({product, shopAddress, isOwner, RemoveProductOnClick, BuyProductClick}) => (
    <div className="pure-g">
        <div className="pure-u-1-8">
            <div className="logo-entry"><Image url={product.image} width={100} height={100}
                                              title={product.name}/></div>
        </div>
        <div className="pure-u-1-4">
            <div className="name entity">{product.name}</div>
        </div>
        <div className="pure-u-1-12">
            <div className="price-entity entity">{product.price}</div>
        </div>
        <div className="pure-u-1-12">
            <div className="quantity-entity entity">{product.quantity}</div>
        </div>
        <div className="pure-u-5-24">
            { product.quantity>0 &&
            <div className="actions-entry">
                <BuyProduct productId={product.id} onClick={BuyProductClick}/>
            </div>
            }
            { product.quantity===0 && <div className="out-of-stock-entity entity">Out of stock</div> }
    </div>
        <div className="pure-u-1-4">
            <div className="actions-entry">
                {isOwner &&
                <span>
                    <Link to={'/shop/' + shopAddress + '/edit-product/' + product.id}>
                      <button className="button-secondary pure-button">Edit</button>
                    </Link>
                    &nbsp;
                    <button className="button-error pure-button" onClick={RemoveProductOnClick(product.id)}>Remove</button>
                </span>
                }
            </div>
        </div>
    </div>
);

export default ProductListItem;
