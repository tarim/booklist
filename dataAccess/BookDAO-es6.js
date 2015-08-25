var MongoClient = require('mongodb').MongoClient;

class DAO{
    open(){
        let result = MongoClient.connect('mongodb://localhost:27017/mongotest');

        //handling error like this will keep the resulting promise in error state
        result.catch(err => {
            this.logError('Error connecting ' + err);
        });
        return result;
    }
    confirmSingleResult(res){
        let numInserted = +res.result.n;
        if (!numInserted) {
            throw 'Object not inserted';
        }
        if (numInserted > 1){
            throw 'Expected 1 object to be inserted.  Actual ' + numInserted;
        }
    }
    logError(err){
        console.log(err);
    }
    logErrorAndReThrow(err){
        this.logError(err);
        throw err;
    }
    dispose(db){
        db.close();
        console.log('DISPOSED');
    }
}

function dbOperation(target, name, descriptor){
    let f = descriptor.value;
    descriptor.value = async function(...args){
        let db = await this.open();
        try {
            await f.apply(this, [db, ...args]);
        } finally{
            this.dispose(db);
        }
    };
    return descriptor;
}

class BookDAO extends DAO {
    constructor(userId){
        super();
        this.userId = userId;
    }
    @dbOperation
    async saveBook(db, book){
        book.userId = this.userId;
        let result = await db.collection('books').insert(book);
        this.confirmSingleResult(result);
    }
}


module.exports = BookDAO;