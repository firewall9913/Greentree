var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    http = require('http'),
    qs = require('querystring');
    peers = {},
    nick = '',
    crypto=require('crypto'),
    Database='',
    things ={},
    k=0,
    i=0,
    index = 0;

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url0 = 'mongodb://localhost:27017/test';

MongoClient.connect(url0, function(err, db) {
	Database = db;
	var nicker = function(post){
	    //post.nick, post.hash
	 console.log(post.nick, post.key);
	  for (var i in peers) {
	      console.log(peers[i].key);
	      if(peers[i].key === post.key){
	          console.log(true);
	        peers[i].nick = post.nick;
	      }
	  }
	};

	function findNickByHash(hash) {
	    for (var i in peers) {
	      if(peers[i].key === hash){
	        return peers[i].nick;
	      }
	  }
	};


	var insertUser = function(db, hash, nick){
		db.collection('users').insertOne( {
			"nick":nick,
			"hash":hash
		}, function (err, result){
			assert.equal(err,null);
			console.log('New user is added into the Database.');
		});
	};

	var insertDocument = function(db, hash, msg, ipForSend,  TimeFromChrist, k) {
	   db.collection('data').insertOne( {
	   		 "number" : k,
	         "hash" : hash,
	         "msg" :  msg,
	         "time" : TimeFromChrist,
	         "ip" : ipForSend 
	    }, function(err, result) {
	    	assert.equal(err, null);
	    	console.log("Inserted a message into the Database.");
	  	});
	};

   


	var SendXLastDocuments = function(db, X, ws){
		if (k!=0){
		if (k-X<0) {
			i=0;
		} else {
			i=k-X
		};
		for (i!=k; i++){
			db.collection('data').find({"number":i}).toArray(function(err,things){
				console.log(things);
				var newdata ={message:things.msg, nick:findNickByHash(things.hash)};
				ws.send(newdata);
			});
		};
	};
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
	                console.log('Зарегистрирован '+nick);
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
	host = '192.168.1.59';
	server.listen(port, host);
	console.log('listening at http://' + host +':' + port);
	wss.on('connection', function(ws){
	  key = handshake(ws);
	  index += 1;
	  StrangeIp = ws._socket.remoteAddress;
	  ip = StrangeIp.substr(7);
	  peers[index] = {ws:ws, ip:ip, key:key};
	  console.log("новое соединение " + index);
	  insertUser (Database, key, peers[index].nick, k)
	  SendXLastDocuments (Database, 100, ws);
	  ws.on('close', closeConn(index));
	});


	function broadcast(data){
	  for (var i in peers) {  
	    if (peers[i] != undefined) {
	      send(peers[i].ws, data)
	    }
	  };
	  insertDocument(Database, peers[i].key, data.message, peers[i].ip, ''+Date.now() );
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