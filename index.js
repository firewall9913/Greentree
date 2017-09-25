
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    http = require('http'),
    qs = require('querystring');
    peers = {};
    crypto=require('crypto'),
    Database='',
	syncedUsers = {};
    things ={},
	aBit = 100,
    k=0,
    i=0,
    index = 0;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url0 = 'mongodb://freebadman:1813@ds135394.mlab.com:35394/yellowbeedb';

MongoClient.connect(url0, function(err, db) {
	Database = db;
    sync(Database);
	var nicker = function(post){
	    //post.nick, post.hash
	 console.log(post.nick, post.key);
	  for (var i in peers) {
	      if(peers[i].key === post.key){
	      	console.log(true);
	        peers[i].nick = post.nick;
	        insertUser(Database, peers[i].key, post.nick);
	      }
	  }
	};


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

	function findNickByHash(hash) {
	    for (var i in peers) {
	      if(peers[i].key === hash){
	        return peers[i].nick;
	      }
	  }
	}

	function findAndSend(hash, msg, ws) {
		var nick = findNickByHashInSyncedUsers(hash);
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


	var SendLastDocumentsV2 = function(db, ws){
			db.collection('data').find().sort({time : 1}).toArray(function(err,things){
				for(i in things){
					findAndSend(things[i].hash, things[i].msg, ws);
					console.log(i);
				}
			});
	};

	server = http.createServer( function(req, res) {
	  console.log(req.method);
	  res.setHeader('Access-Control-Allow-Origin','*');
	  if (req.method =='POST') {
	    var body = '';
	    req.on('data', function (data){
	      body += data;
	    });
	    req.on('end', function(){
	      var post = qs.parse(body);

	     
	        switch(post.type){
	            case 'handshake':
	                nicker(post);
	                console.log('Зарегистрирован '+post.nick);
	                res.end('registration completed');
	                break;
	                
	            default:
	                if (post.message != undefined){
	                    if(post.message=='/stat'){
	                          showStat();
	                        } else{
	                          post.nick = findNickByHash(post.key);    
	                          broadcast(post);
	                        }
	                        res.writeHead(200, {'Content-Type': 'text/html'});
	                        res.end('post received');
	                  } 
	                break;
	        }
	          

	    });
	  } else {res.end('post received')
	  }
	});


	var closeConn = function (index) {
	  return function(){ 
	    console.log('соединение закрыто ' + index);
	    delete peers[index];
	  }
	};

	port = 9001;
	host = '192.168.1.12';
	server.listen(port, host);
	console.log('listening at http://' + host +':' + port);
	wss.on('connection', function(ws){
	  key = handshake(ws);
	  index += 1;
	  StrangeIp = ws._socket.remoteAddress;
	  ip = StrangeIp.substr(7);
	  peers[index] = {ws:ws, ip:ip, key:key};
	  console.log("новое соединение " + index + Date.now());
	  SendLastDocumentsV2 (Database, ws);
	  ws.on('close', closeConn(index));
	});


	function broadcast(data){
	  for (var i in peers) {  
	    if (peers[i] != undefined) {
	      send(peers[i].ws, data);
	      insertDocument(Database, peers[i].key, data.message, peers[i].ip, ''+Date.now() );
	    }
	  }
	}

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
	  broadcast(post);
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