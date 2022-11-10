const express = require('express');
const cors = require('cors');
const path = require('path');
const GameController = require('../controller/GameController');
const init = require('../controller/init');

class Server {

    #port;
    #server;
    #GameController;
    
    constructor(port) {
        this.#port = port;
        this.#server = express();
        this.#server.use(express.json());
        this.#server.use(cors());
    }

    initController() {
        return new Promise(((resolve,reject) => {
            init.initTeams(path.join(__dirname, "../","json","teams.json")).then((finalTeams) => {
                this.#GameController = new GameController(finalTeams);
                resolve();
            }).catch((err) => {
                reject(err);
            });
        }))
    }
    
    start() {
        const that = this;
        return new Promise(function(resolve,reject) {
            that.initController().then(() => {
                that.#server.get("/game", that.postGame);
                that.#server.listen(that.#port, () => {
                    console.log("Server started successfully at port: "   + that.#port);
                    resolve(true);
                } );
            }).catch((err) => {
                reject(err);
            });
        });
    }

    postGame(req, res) {
        console.log("REQUEST RECEIVED");
    }

}

module.exports = Server;