import { Game } from "../ConjectureMultiAgentGame.js";
import { QuarticMachineX, QuarticMachineY } from './ScalarQuarticPlayers.js';
import DEFAULT_PARAMETERS from './default-parameters.js';
// Quartic game
// Section 5.A example: https://github.com/bchasnov/research/blob/master/papers/2020-ccabr-stability-of-nash.pdf

const SCALAR_QUARTIC_GAME_CONFIGURABLE_CONSTANTS = ['epsilon_one, epsilon_two'];

var ScalarQuarticGame = Object.create(Game);
ScalarQuarticGame.setupGame = function(parameters, mode) {
    this.init(parameters, mode, QuarticMachineX, QuarticMachineY);
}

ScalarQuarticGame._fixedPoint = function () {
    return [0, 0];
}

ScalarQuarticGame._addCurrentGameHistoryToData = function () {
    this.dataIndex.push({
        gameType: "quartic-scalar-game",
        payload: {
            dataPoints: this.dataPoints,
            parameters: this.parameters,
        }
    })
}

export { ScalarQuarticGame, SCALAR_QUARTIC_GAME_CONFIGURABLE_CONSTANTS };