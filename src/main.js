const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('6d65693cd44aae24c79911497873749cf9f961d6b40e90f8283e26ae828260a5');
const myWalletAddress = myKey.getPublic('hex');


let kostasCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
kostasCoin.addTransaction(tx1);

console.log('\n Starting the miner....');
kostasCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Konstantina is', kostasCoin.getBalanceOfAddress(myWalletAddress));


//console.log(JSON.stringify(kostasCoin, null, 4));