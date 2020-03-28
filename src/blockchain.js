const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAdress, toAdress, amount){
        this.fromAdress = fromAdress;
        this.toAdress = toAdress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAdress + this.toAdress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAdress){
            throw new Error('You cannot sign transaction for other wallets!');
        }
        
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex'); 
    }

    isValid(){
        if(this.fromAdress === null) return true; 

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAdress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}
class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    } 

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){ // trick to make a string of zeros exactly the length of difficulty
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    hasValidTransaction(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}


class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block("01/01/2020", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block succesfully mined');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

// this method adds new transactions to our blockchain

    addTransaction(transaction){

        if(!transaction.fromAdress || !transaction.toAdress){
            throw new Error('Transaction must inlcude from and to address');
        }

        if(!transaction.isValid){
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    } 

    getBalanceOfAddress(address){
        let balance = 0;
        
        for (const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAdress === address){
                    balance -= trans.amount;
                }

                if(trans.toAdress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

// this method goes through all of the blocks in our chain and verifies that the hashes are correct and that each blocks links to the previous block
  
    isChainValid(){ //we don't start with the first block (0) because that is the genesis block
        for(let i=1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }

}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;