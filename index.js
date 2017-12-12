var User = require('./modules/users.js');
var Peers = require('./modules/peers.js');
var Database = require('./modules/database.js');
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    peers = new Peers();
var crypto=require('crypto'),
    database=new Database,
    syncedUsers = {};
var things ={},
    syncedMsgs = {},
    aBit = 100,
    k=0,
    i=0,
    index = 0;


var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url0 = 'mongodb://freebadman:1813@ds135394.mlab.com:35394/yellowbeedb';

function temp() {
    if (post.message != undefined){
        if(post.message=='/stat'){
            showStat();
        } else{
            post.nick = peers.findNickByHash(post.key);
            peers.broadcast(post, Database);
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
    }
}

MongoClient.connect(url0, function(err, db) {
    Database = db;
    sync(Database);
    sync_msg(Database);
    var nicker = function(post){
        var user = new User (post.key, post.nick);
        for (var i in peers) {
            if(peers[i].key === user.hash){
                console.log(true);
                peers[i].nick = user.nick;
                insertUser(Database, user.hash, user.nick);
            }
        }
    };

    function sync_msg (db){
        db.collection('data').find().toArray(function(err,things){
            for(i in things){
                syncedMsgs[i] = {"hash" : things[i].hash, "time" : things[i].time, "msg" : things[i].msg, "ip" : things[i].ip};
            }
        });
    }

    function sync (db){
        db.collection('users').find().toArray(function(err,things){
            for(i in things){
                console.log( things[i].nick + " Никнейм из базы");
                syncedUsers[i] = {"hash" : things[i].hash, "nick" : things[i].nick};
            }
        });
    }

    function findNickByHashInSyncedUsers(hash) {
        for (var i in syncedUsers) {
            if(syncedUsers[i].hash === hash){
                return syncedUsers[i].nick;
            }
        }
    }



    function findAndSend(hash, msg, ws) {
        var nick = peers.findNickByHashInSyncedUsers(hash);
        var forSend={message:msg, nick:nick};
        ws.send(JSON.stringify(forSend));
    }


    var insertUser = function(db, hash, nick){
        syncedUsers[Date.now()]= {hash: hash, nick:nick};
        console.log (syncedUsers);
        
        db.collection('users').insertOne( {
            "nick":nick,
            "hash":hash
        }, function (err, result){
            assert.equal(err,null);
            console.log('New user is added into the Database.');
        });
    };

    var insertDocument = function(db, hash, msg, ipForSend,  TimeFromChrist) {
        db.collection('data').insertOne( {
            "hash" : hash,
            "msg" :  msg,
            "time" : TimeFromChrist,
            "ip" : ipForSend
        }, function(err, result) {
            assert.equal(err, null);
            console.log("Inserted a message into the Database.");
        });
    };


    var SendLastDocuments = function(db, ws){
            for(i in syncedMsgs){
                console.log(syncedMsgs[i].hash, syncedMsgs[i].msg);
                findAndSend(syncedMsgs[i].hash, syncedMsgs[i].msg, ws);
                console.log(i);
            }
    };

    

    

    port = 9001;
    host = '192.168.1.41';
    server.listen(port, host);
    console.log('listening at http://' + host +':' + port);
    wss.on('connection', function(ws){
        key = handshake(ws);
        index += 1;
        StrangeIp = ws._socket.remoteAddress;
        ip = StrangeIp.substr(7);
        peers[index] = {ws:ws, ip:ip, key:key};
        console.log("новое соединение " + index + Date.now());
        SendLastDocuments (Database, ws);
        ws.on('close', peers.closeConn(index));
    });

    var showStat = function(){
        var post = {};
        post.nick = 'Websocket';
        var stat = '<hr/>';
        for (var i in peers){
            if (peers[i] != undefined) {
                var stat = stat+'Соединение '+i+' - '+peers[i].ip+' - '+peers[i].nick+'  '
            }
        }
        stat = stat+'<hr/>';
        post.message = stat;
        peers.broadcast(post, Database);
    
        stat = 'Соединение ';
    };

    var send = function (ws, data){
        ws.send (JSON.stringify (data));
        k++;
    }

    function handshake(ws){
        var time = ''+Date.now(),
            number = ''+Math.random(),
            Hash = crypto.createHash('sha1')
                .update(time)
                .update(number)
                .digest('base64');
        cache = {type:'handshake', key:Hash};
        ws.send (JSON.stringify (cache));
        return Hash;
    }
});
//чую, надо начинать писать комментарии...