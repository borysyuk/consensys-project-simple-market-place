import React from 'react';
import ProductListItem from './ProductListItem';

const ProductList = ({products, shopAddress, isOwner, RemoveProductOnClick, BuyProductClick}) => (
    <div className="entity-list product-list">
        <div className="pure-g header">
            <div className="pure-u-1-8">
                <div className="header-item">Image</div>
            </div>
            <div className="pure-u-1-4">
                <div className="header-item">Name</div>
            </div>
            <div className="pure-u-1-12">
                <div className="header-item">Price (eth)</div>
            </div>
            <div className="pure-u-1-12">
                <div className="header-item">Quantity</div>
            </div>
            <div className="pure-u-5-24">
                <div className="header-item"></div>
            </div>
            <div className="pure-u-1-4">
                <div className="header-item">Actions</div>
            </div>
        </div>

        {products.map(product =>
            <ProductListItem
                key={product.id}
                product={product}
                shopAddress={shopAddress}
                isOwner={isOwner}
                RemoveProductOnClick={RemoveProductOnClick}
                BuyProductClick={BuyProductClick}
            />
        )}
    </div>
);

export default ProductList;
