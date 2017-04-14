var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    http = require('http'),
    qs = require('querystring');
    peers = {},
    nick = '',
    crypto=require('crypto'),
    index = 0;

var nicker = function(post){
  return function(){
    nick += post.nick;
  }
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
      if (post.type = 'handshake'){
        nicker(post);
        console.log('Зарегистрирован '+nick);
        res.end('registration completed');
      }
      if (post.message != undefined){
        console.log(post);
        if(post.message=='/stat'){
          showStat();
        } else{
          broadcast(post);
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
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
  handshake(ws);
  index += 1;
  StrangeIp = ws._socket.remoteAddress;
  ip = StrangeIp.substr(7);
  peers[index] = {ws:ws, ip:ip, nick:nick};
  console.log("новое соединение " + index);  
  ws.on('close', closeConn(index));
});


function broadcast(data){
  for (var i = 1; i < peers.length; i++) {
    if (peers[i] != undefined) {
      send(peers.ws[i])
    }
  };
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
};

var send = function (ws){
  ws.send (JSON.stringify (data));
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
  var something = '';
}