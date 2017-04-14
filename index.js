var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port:9000}),
    http = require('http'),
    qs = require('querystring');
    peers = {},
    nick = '',
    crypto=require('crypto'),
    index = 0;

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
}

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
host = '192.168.1.12';
server.listen(port, host);
console.log('listening at http://' + host +':' + port);
wss.on('connection', function(ws){
  key = handshake(ws);
  index += 1;
  StrangeIp = ws._socket.remoteAddress;
  ip = StrangeIp.substr(7);
  peers[index] = {ws:ws, ip:ip, key:key};
  console.log("новое соединение " + index);  
  ws.on('close', closeConn(index));
});


function broadcast(data){
  for (var i in peers) {  
    if (peers[i] != undefined) {
      send(peers[i].ws, data)
    }
  };
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