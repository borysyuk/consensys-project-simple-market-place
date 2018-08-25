# Design patterns

## Safe Math
I have used this library to avoid overflowing during math operations.

## Withdrawal from Contracts
I have use this pattern to allow shop owner takes funds from his shop. The shop contract doesn't spend the funds by it self so owner can get any value of existing funds in any time.

## Restricting Access
I have used Ownable and Roles to implement access rules because in my project different users have different roles (Contract owner, Admin, Shop Owner and Regular user).

## Emergency Stop
I have use OpenZeppelin library to implement this pattern in my projects. Shop owner can "pause" his shop and nobody can buy a product.

## Factory
I have used this patter to create stand alone shop contracts. So even, if you remove your shop from marketplace list - the shop will exists in chain and you will have access to it and all functionality will be allowed.

## Destrucsible / Mortal
To allows shop owner "delete" his shop from chain and take all funds.

## Iterable lists
I have create library of iterable list of ids. This library based by two way direction list and allows add, remove and "walk" in two direction. Based on this List library, i have created iterable Product catalog and Shop list libraries.
