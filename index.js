var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 9000}),
	http = require('http'),
	qs = require('querystring'),
	peers = [],
    index = 0;

server = http.createServer( function(req, res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
        	var post = qs.parse(body);
            console.log(post);
            broadcast(post);
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
    } else {
    	res.end('post received');
    }
    
});

var closeCo = function (index) {
    return function () {
        console.log('Минус один дракон');
        delete peers[index];
    }
} 

server.listen(9001, 'localhost');

wss.on('connection', function (ws) { 
    index += 1;
	peers[index] = ws;
    ws.on('close', closeCo(index));
});

function broadcast(data){
    console.log(data);
	peers.forEach (function (ws) {
        console.log(ws);
		ws.send (JSON.stringify(data), function(error){console.log(error)});
	});
}
