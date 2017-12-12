class Peers {
    constructor(){
        this.peers = [];
        this.index = 0;
    }
    
    closeConn (index) {
        return function(){
            console.log('соединение закрыто ' + index);
            delete this.peers[index];
        }
    }
    
    broadcast (Database, data){
        for (var i in peers) {
           
            if (this.peers[i] != undefined) {
                send(this.peers[i].ws, data);

            }
        }
    }
    
    findNickByHash (hash) {
        return this.peers.find((user)=>{
            if (user.key === hash) {
                return true;
            } 
        })
    }
    
}

module.exports = Peers;