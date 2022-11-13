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
                that.#server.get("/games", that.getGames.bind(that));
                that.#server.post("/game", that.postGame.bind(that));
                that.#server.get("/gameUpdate", that.getUpdatedGame.bind(that));
                that.#server.get("/clearGame", that.removeActiveGame.bind(that));
                that.#server.listen(that.#port, () => {
                    console.log("Server started successfully at port: "   + that.#port);
                    resolve(true);
                } );
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getGames(req, res) {
        this.#GameController.initializeGames("2022-11-09").then((games) => {
            res.status(200).json(games);
        }).catch((err) => {
            res.status(500).json({"errorMessage": err});
        })
    }

    postGame(req,res) {
        if (!req.query.id) {
            res.status(400).json({"errorMessage": "Game ID not provided with request"});
            return;
        }
        this.#GameController.createActiveGame(req.query.id).then((game) => {
            res.status(200).json(game);
        }).catch((err) => {
            res.status(500).json({"errorMessage": err});
        });
    }

    getUpdatedGame(req,res) {
        this.#GameController.updateActiveGame().then((game) => {
            res.status(200).json(game);
        }).catch((err) => {
            res.status(500).json({"errorMessage": err});
        })
    }

    removeActiveGame(req,res) {
        try {
            this.#GameController.removeActiveGame();
            res.status(200).json({"message": "Active game cleared"});    
        } catch (err) {
            res.status(500).json({"errorMessage": "An error occurred while clearing active game. Please try again"});
        }
        
    }

}

module.exports = Server;