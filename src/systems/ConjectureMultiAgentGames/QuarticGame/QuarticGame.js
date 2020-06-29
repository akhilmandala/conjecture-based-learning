import { Game } from "../ConjectureMultiAgentGame.js";
import { QuarticMachineX, QuarticMachineY } from './QuarticPlayers.js';

// Quartic game
// Section 5.A example: https://github.com/bchasnov/research/blob/master/papers/2020-ccabr-stability-of-nash.pdf

var QuarticGame = Object.create(Game);
QuarticGame.setupGame = function(parameters, mode) {
    this.init(parameters, mode, QuarticMachineX, QuarticMachineY);
}

QuarticGame._addCurrentGameHistoryToData = function () {
    this.dataIndex.push({
        gameType: "quartic-scalar-game",
        payload: {
            dataPoints: this.dataPoints,
            parameters: this.parameters,
        }
    })
}

export { QuarticGame };