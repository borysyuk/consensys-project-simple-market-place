# Avoiding common attacks

## Integer Overflow and Underflow
To avoid this attack i have used SafeMath for all math operations


## Reentrancy:
SimpleShop.withdraw function uses transfer instead of call and does not change the state at all.


## Timestamp Dependence
My contracts do not use timestamps at all.


## Transaction-Ordering Dependence (TOD) / Front Running
My contracts have independent of order transactions. 


## DoS with (Unexpected) revert
My contracts have independent transactions, so if hacker got "revert" this "revert" to influences on own transaction only. 


## DoS with Block Gas Limit
My contracts do not have "long" operations with loops.   


## Forcibly Sending Ether to a Contract
My contracts do not store balance of eth at all. 


## Underflow in Depth: Storage Manipulation
To avoid this attack i have used SafeMath for all math operations


## Cross-function Race Conditions
SimpleShop.withdraw function uses transfer instead of call and does not change the state at all.