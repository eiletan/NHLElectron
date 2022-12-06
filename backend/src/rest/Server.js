const express = require('express');
const cors = require('cors');
const path = require('path');
const GameController = require('../controller/GameController');
const util = require("../controller/util");
const init = require('../controller/init');
const { query } = require('express');

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
                that.#server.delete("/clearGame", that.removeActiveGame.bind(that));
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
        if (!req.query.date) {
            res.status(400).json({"errorMessage": "No date provided."});
            return;
        }
        if (!util.checkDateFormat(String(req.query.date))) {
            res.status(400).json({"errorMessage": "Incorrect date format. Please provide date in YYYY-MM-DD format"});
            return;
        };
        this.#GameController.initializeGames(String(req.query.date)).then((games) => {
            res.status(200).json(games);
        }).catch((err) => {
            res.status(500).json({"errorMessage": err});
        })
    }

    postGame(req,res) {
        let gameId = req.body.gameId;
        if (!gameId) {
            res.status(400).json({"errorMessage": "Game ID not provided with request"});
            return;
        }
        
        this.#GameController.createActiveGame(gameId).then((game) => {
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