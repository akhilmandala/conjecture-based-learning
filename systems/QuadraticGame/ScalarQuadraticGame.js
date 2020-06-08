import {Game} from '../GameObject.js'
import {QuadraticMachineX, QuadraticMachineY} from './QuadraticPlayers.js';

var ScalarQuadraticGame = Object.create(Game);

/**
 * Initializes a Game where both players employ quadratic gradient-descent strategies.
 * @param {Object} parameters - Object containing gameplay parameters (for both x and y players) and visual parameters
 * @param {string} mode - game input/playthrough mode ['sim', 'p1-vs-sim', 'sim-vs-p2', 'p1-vs-p2']
 */
ScalarQuadraticGame.setupGame = function (parameters, mode) {
    this.init(parameters);
    this.mode = mode;
    this.playerOne = Object.create(QuadraticMachineX);
    this.playerTwo = Object.create(QuadraticMachineY);
    this.currentAction = [parameters.gameplayParameters.x0, parameters.gameplayParameters.y0];
    
    this.playerOne.createPlayer(parameters.gameplayParameters, this.currentAction[0]);
    this.playerTwo.createPlayer(parameters.gameplayParameters, this.currentAction[1]);
};

/**
 * Returns the fixed point of the quadratic game
 * @returns {Array} [x, y] of the fixed point of the system
 */
ScalarQuadraticGame.fixedPoint = function () {
    const { a, b, c1, c2, d, e } = this.parameters.gameplayParameters;
    return [-(b * d - c1 * e) / (a * b - c1 * c2),
    -(c2 * d - a * e) / (-a * b + c1 * c2)];
}

/**
 * Calculates the next actions to be taken given the current action and/or player input
 * @param {number} x - current x-action
 * @param {number} y - current y-action
 * @param {number} [x_in=0] - x-action for next timestep
 * @param {number} [y_in=0] - y-action for next timestep
 * @returns {Array} Returns action for next timestep
 */
ScalarQuadraticGame.calculateNextAction = function (x, y, x_in=0, y_in=0) {
    //Output
    let x_out = NaN;
    let y_out = NaN;

    let dt = 0.02;

    switch (this.mode) {
        case 'sim':
            x_out = x - dt * this.playerOne.update(x, y);
            y_out = y - dt * this.playerTwo.update(x, y);
            break;
        case 'p1-vs-sim':
            x_out = x_in;
            y_out = y - dt * this.playerTwo.update(x, y);
            break;
        case 'sim-vs-p2':
            x_out = x - dt * this.playerOne.update(x, y);
            y_out = y_in;
            break;
        case 'p1-vs-p2':
            x_out = x_in;
            y_out = y_in;
            return;
    }

    return [x_out, y_out]
};

/**
 * Steps the game forward one timestep
 */
ScalarQuadraticGame.step = function () {
    // Get mouse input
    var x_in = 0;
    var y_in = 0;

    var {currentAction} = this;


    var nextAction = this.calculateNextAction(currentAction[0], currentAction[1], x_in, y_in);
    this.currentAction = nextAction;
    this.dataPoints.push(currentAction);
};

export { ScalarQuadraticGame };