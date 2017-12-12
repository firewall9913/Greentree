var MongoClient = require('mongodb').MongoClient;

class Database {
    constructor(){
        var url0 = 'mongodb://freebadman:1813@ds135394.mlab.com:35394/yellowbeedb';
        this.db = new Promise((resolve, reject) => {
            MongoClient.connect(url0, function(err, db) {
                if (!err) {
                    this.db = db;
                    resolve();
                }
            });
        });
    }
    
    saveMsg () {
         insertDocument(Database, this.peers[i].key, data.message, peers[i].ip, ''+Date.now());
         
    }
   
    
}

module.exports = Database;