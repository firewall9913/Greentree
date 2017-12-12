var WebSocketServer = require('ws').Server;

class WsInstance {
    construct() {
        wss = new WebSocketServer({port:9000})
    }
}