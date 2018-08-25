import React from 'react';
import ShopListItem from './ShopListItem';

const ShopList = ({shops, isOwner, RemoveShopOnClick}) => (
    <div className="entity-list shop-list">
        <div className="pure-g header">
            <div className="pure-u-1-8">
                <div className="header-item">Logo</div>
            </div>
            <div className="pure-u-1-8">
                <div className="header-item">Name</div>
            </div>
            <div className="pure-u-1-2">
                <div className="header-item">Description</div>
            </div>
            <div className="pure-u-1-4">
                {isOwner && <div className="header-item">Actions</div>}
            </div>
        </div>

        {shops.map(shop =>
            <ShopListItem
                key={shop.id}
                shop={shop}
                isOwner={isOwner}
                RemoveShopOnClick={RemoveShopOnClick}
            />
        )}
    </div>
);

export default ShopList
