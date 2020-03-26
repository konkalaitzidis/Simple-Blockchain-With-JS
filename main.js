const SHA256 = require('crypto-js/sha256')


class Transaction{
    constructor(fromAdress, toAdress, amount){
        this.fromAdress = fromAdress;
        this.toAdress = toAdress;
        this.amount = amount;
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

    createTransaction(transaction){
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

    isChainValid(){ //we don't start with the first block (0) because that is the genesis block
        for(let i=1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

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

let kostasCoin = new Blockchain();

kostasCoin.createTransaction(new Transaction('address 1', 'address 2', 100));
kostasCoin.createTransaction(new Transaction('address 2', 'address 1', 50));

console.log('\n Starting the miner....');
kostasCoin.minePendingTransactions('konstantina-address');

console.log('\nBalance of Konstantina is', kostasCoin.getBalanceOfAddress('konstantina-address'));

console.log('\n Starting the miner....');
kostasCoin.minePendingTransactions('konstantina-address');

console.log('\nBalance of Konstantina is', kostasCoin.getBalanceOfAddress('konstantina-address'));





//console.log(JSON.stringify(kostasCoin, null, 4));