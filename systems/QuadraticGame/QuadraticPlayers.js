import {Player} from '../GameObject.js'
import { poly_barrier } from './helpers.js'
/**
 * QUADRATIC GAME - PLAYER FUNCTIONS
 * QuadraticMachineX - player controlling "x" action;
 * QuadraticMachineY - player controlling "y" action;
 */
var QuadraticMachineX = Object.create(Player);

/**
 * Creates a player with a quadratic-gradient-descent strategy, controls x action.
 * @param {Object} parameters - Gameplay parameters for the player: [a, c1, d, p1LearningRate, barrier, xLimit]
 * @param {number} initialAction - initial x-action to be taken by player
 * @returns {void} Nothing
 */
QuadraticMachineX.createPlayer = function (parameters, initialAction) {
    this.init(parameters);
    this.action = initialAction;
};

/**
 * Calculates the cost of current action for a quadratic player x
 * @param {number} x - x-input of action
 * @param {number} y - y-input of action
 * @returns {number}  Player X's cost for current global action
 */
QuadraticMachineX.cost = function (x, y) {
    const { a, c1, d } = this.parameters;
    return ((a / 2) * x * x) + (c1 * x * y) + d * x;
};

/**
 * Calculates magnitude of update for quadratic player x, according to a gradient
 * descent strategy.
 * @param {number} x - x-input of action
 * @param {number} y - y-input of action
 * @returns {number} Returns next step update for quadratic player x
 */
QuadraticMachineX.update = function (x, y) {
    const { a, c1, d, p1LearningRate, barrier, xLimit } = this.parameters;
    return p1LearningRate * (a * x + c1 * y + d + barrier * poly_barrier(x, -xLimit, xLimit));
};

/**
 * Calculates best x-action in response to a given y-action
 * @param {number} y - y-input of action
 * @returns {number} Returns best update for quadratic player x
 */
QuadraticMachineX.bestResponse = function (y) {
    const { a, c1, d } = this.parameters;
    return (-d - c1 * y) / a;
};

var QuadraticMachineY = Object.create(Player);

/**
 * Creates a player with a quadratic-gradient-descent strategy, controls y action.
 * @param {Object} parameters - Gameplay parameters for the player: [b, c2, e, p2LearningRate, barrier, yLimit]
 * @param {number} initialAction - initial y-action to be taken by player
 * @returns {void} Nothing
 */
QuadraticMachineY.createPlayer = function (parameters, initialAction) {
    this.init(parameters);
    this.action = initialAction;
};

/**
 * Calculates the cost of current action for a quadratic player y
 * @param {number} x - x-input of action
 * @param {number} y - y-input of action
 * @returns {number}  Player Y's cost for current global action
 */
QuadraticMachineY.cost = function (x, y) {
    const { b, c2, e } = this.parameters;
    return ((b / 2) * y * y) + (c2 * x * y) + e * y;
};

/**
 * Calculates magnitude of update for quadratic player y, according to a gradient
 * descent strategy.
 * @param {number} x - x-input of action
 * @param {number} y - y-input of action
 * @returns {number} Returns next step update for quadratic player y
 */
QuadraticMachineY.update = function (x, y) {
    const { b, c2, e, p2LearningRate, barrier, yLimit } = this.parameters;
    return p2LearningRate * (b * y + c2 * x + e + barrier * poly_barrier(y, -yLimit, yLimit));
};

/**
 * Calculates best y-action in response to a given x-action
 * @param {number} x - x-input of action
 * @returns {number} Returns best update for quadratic player y
 */
QuadraticMachineY.bestResponse = function (x) {
    const { b, c2, e } = this.parameters;
    return (-e - c2 * x) / b;
};

export {QuadraticMachineX, QuadraticMachineY};