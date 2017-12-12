class MessageSend {
    construct() {
        this.syncedMsgs=[];
    }
    
    syncedMsgs = function () {
        this.syncedMsgs[Date.now()]= {"hash": this.peers[i].key, "msg" : data.message, "ip" : this.peers[i].ip, "time" : ''+Date.now()};
    }
}