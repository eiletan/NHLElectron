const game = require('./game');


class GameController {

    activeGame;
    internalTeams;
    
    constructor(teams) {
        this.internalTeams = teams;
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
        return game.updateGameStatus().then((updatedGame) => {
            this.activeGame = updatedGame;
            return this.activeGame;
        }).catch((err) => {
            throw err;
        })
    }


    
    

}

module.exports = GameController;