const express = require('express');
const cors = require('cors');

class Server {

    #port;
    #server;
    
    constructor(port) {
        this.#port = port;
        this.#server = express();
        this.#server.use(express.json());
        this.#server.use(cors());
    }
    
    start() {
        const that = this;
        return new Promise(function(resolve,reject) {
            try {
                that.#server.get("/game", that.postGame);
                that.#server.listen(that.#port, () => {
                    console.log("Server started successfully at port: "   + that.#port);
                    resolve(true);
                } );
            } catch (error) {
                reject(error);
            }
        });
    }

    postGame(req, res) {
        console.log("REQUEST RECEIVED");
    }

}

module.exports = Server;