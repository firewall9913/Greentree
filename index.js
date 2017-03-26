var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    http = require('http'),
    qs = require('querystring');
    peers = [],
    peersIP = [];
var index = 0;

    

server = http.createServer( function(req, res) {
	console.log(req.method);
	if (req.method =='POST') {
		console.log("POST");
		var body = '';
		req.on('data', function (data){
			body += data;
			console.log("Partical body: " + body);
		});
		req.on('end', function(){
			var post = qs.parse(body);
			console.log(post);
			if(post.message=='/stat'){
            post.nick = 'Websocket ';
            var stat = '';
            for (var i = 1; i < peers.length; i++){
            	if (peers[i] != undefined) {
            		var stat = stat+'Соединение '+i+' - '+peersIP[i]+'; '
            	}
            }
            post.message = stat;
			broadcast(post);
			stat = 'Соединение ';
			} else{
			broadcast(post);
		}

		})
		res.writeHead(200, {'Content-Type': 'text/html'});
	    res.end('post received');
	} else {res.end('post received');
}
});

var closeConn = function (index) {
    return function(){ 
        console.log('соединение закрыто ' + index);
        delete peers[index];
        delete peersIP[index];
    }
}

port = 9001;
host = '192.168.1.12';
server.listen(port, host);
console.log('listening at http://' + host +':' + port);
wss.on('connection', function(ws){
  index += 1;
  StrangeIp = ws._socket.remoteAddress;
  ip = StrangeIp.substr(7);
  peers[index] = ws;
  peersIP[index] = ip;
  console.log("новое соединение " + index);  
  ws.on('close', closeConn(index));
});


function broadcast(data){
	peers.forEach (function (ws){
		ws.send (JSON.stringify (data));

	});
}
 