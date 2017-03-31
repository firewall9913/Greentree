var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    http = require('http'),
    qs = require('querystring');
    peers = [],
    nick = '',
	index = 0;

var nicker = function(post){
	return function(){
		nick += post.nick;
		console.log('Получен '+nick);
	}
}

server = http.createServer( function(req, res) {
	console.log(req.method);
	if (req.method =='POST') {
		var body = '';
		req.on('data', function (data){
			body += data;
		});
		req.on('end', function(){
			var post = qs.parse(body);
			if (post.message != undefined){
				console.log(post);
				if(post.message=='/stat'){
      		showStat();
				} else{
					broadcast(post);
			}
		  res.writeHead(200, {'Content-Type': 'text/html'});
	    res.end('post received');
	   } else {res.end('post received')}
    });
  }
})

var closeConn = function (index) {
  return function(){ 
    console.log('соединение закрыто ' + index);
    delete peers[index];
  }
}

port = 9001;
host = '192.168.1.12';
server.listen(port, host);
console.log('listening at http://' + host +':' + port);
wss.on('connection', function(ws){
  handshake(ws);
  index += 1;
  StrangeIp = ws._socket.remoteAddress;
  ip = StrangeIp.substr(7);
  peers[index] = {ws:ws, ip:ip, nick:nick};
  console.log("новое соединение " + index);  
  ws.on('close', closeConn(index));
});


function broadcast(data){
	peers.forEach (function (ws){
		ws.send (JSON.stringify (data));
  });
}

var showStat = function(){
  var post = {};
  post.nick = 'Websocket';
  var stat = '';
  for (var i = 1; i < peers.length; i++){
    if (peers[i] != undefined) {
      var stat = stat+'Соединение '+i+' - '+peers.ip[i]+' - '+peers.nick[i]+';/n  '
    }
  }
  post.message = stat;
  broadcast(post);
  stat = 'Соединение ';
}

function handshake(ws){
  var Hash = crypto.createHash('sha1')
  .update(dateNow())
  .update(Math.random())
  .digest('base64');
  cache = {type:'handshake', key:Hash};
  ws.send (JSON.strigify (cache));
  var something = '';
  req.on('data', function (data){
      something += data;
  });
  req.on('end', function(){
    var hand = qs.parse(something);
    nicker(hand);
    console.log('Зарегистрирован '+nick)
  })
}