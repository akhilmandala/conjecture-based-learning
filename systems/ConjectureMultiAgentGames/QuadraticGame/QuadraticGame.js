import { Game } from '../ConjectureMultiAgentGame.js'
import { QuadraticMachineX, QuadraticMachineY } from './QuadraticPlayers.js';

var SCALAR_QUADRATIC_GAME_CONFIGURABLE_CONSTANTS = ['a', 'b', 'c1', 'c2', 'd', 'e'];

var QuadraticGame = Object.create(Game);

/**
 * Initializes a Game where both players employ quadratic gradient-descent strategies.
 * @param {Object} parameters - Object containing gameplay parameters (for both x and y players) and visual parameters
 * @param {string} mode - game input/playthrough mode ['sim', 'p1-vs-sim', 'sim-vs-p2', 'p1-vs-p2']
 */
QuadraticGame.setupGame = function(parameters, mode) {
    this.init(parameters, mode, QuadraticMachineX, QuadraticMachineY);
}

QuadraticGame._addCurrentGameHistoryToData = function() {
    this.dataIndex.push({
        gameType: "quadratic-scalar-game",
        payload: {
            dataPoints: this.dataPoints,
            parameters: this.parameters,
        }
    })
}

/**
 * Returns the fixed point of the quadratic game
 * @returns {Array} [x, y] of the fixed point of the system
 */
QuadraticGame._fixedPoint = function () {
    const { a, b, c1, c2, d, e } = this.parameters.gameplayParameters;
    return [-(b * d - c1 * e) / (a * b - c1 * c2),
    -(c2 * d - a * e) / (-a * b + c1 * c2)];
}

export { QuadraticGame as ScalarQuadraticGame, SCALAR_QUADRATIC_GAME_CONFIGURABLE_CONSTANTS };