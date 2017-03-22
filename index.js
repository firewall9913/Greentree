var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 9000}),
	http = require('http'),
	qs = require('querystring'),
	peers = [],
    index;

server = http.createServer( function(req, res) {
	console.log(req.method);
    if (req.method == 'POST') {
        console.log("POST");
        var body = '';
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
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

server.listen(9001, '192.168.1.23');

wss.on('connection', function (ws) { 
    index += 1;
	peers[index] = ws;
    ws.on('close', closeCo(index));
});

function broadcast(data){
	peers.forEach (function (ws) {
		ws.send (JSON.stringify(data), function(error){console.log(error)});
	});
}