var http = require('http'),
    qs = require('querystring');

class HttpInstance {
    construct(defaultFunction){
        this.actions = [];
        this.server = http.createServer( function(req, res) {
            res.setHeader('Access-Control-Allow-Origin','*');
            if (req.method =='POST') {
                var body = '';
                req.on('data', function (data){
                    body += data;
                });
                req.on('end', function(){
                    var post = qs.parse(body);
                    if (this.actions[post.type] != null) {
                        this.actions[post.type]();
                    } else {
                        defaultFunction;
                    }
                    /*
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
                                    post.nick = peers.findNickByHash(post.key);
                                    peers.broadcast(post, Database);
                                }
                                res.writeHead(200, {'Content-Type': 'text/html'});
                                res.end('post received');
                            }
                            break;
                    }
                    */


                });
            } else {
                res.end('post received')
            }
        });
    }

}

module.exports = HttpInstance;