const game = require('./game');


class GameController {

    activeGame;
    games;
    internalTeams;
    
    constructor(teams) {
        this.internalTeams = teams;
    }

    initializeGames(date) {
        return game.findGames(date).then((games) => {
            this.games = games;
            return this.games;
        }).catch((err) => {
            throw err;
        })
    }

    createActiveGame(id) {
        return game.createGame(id,this.internalTeams).then((game) => {
            this.activeGame = game;
            return this.activeGame;
        }).catch((err) => {
            throw err;
        });
    }

    updateActiveGame() {
        if (!this.activeGame) {
            throw "Active game not set";
        } 
        return game.updateGameStatus(this.activeGame).then((updatedGame) => {
            this.activeGame = updatedGame;
            return this.activeGame;
        }).catch((err) => {
            throw err;
        })
    }


    
    

}

module.exports = GameController;