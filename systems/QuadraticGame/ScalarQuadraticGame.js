import { Game } from '../GameObject.js'
import { QuadraticMachineX, QuadraticMachineY } from './QuadraticPlayers.js';

var ScalarQuadraticGame = Object.create(Game);

/**
 * Initializes a Game where both players employ quadratic gradient-descent strategies.
 * @param {Object} parameters - Object containing gameplay parameters (for both x and y players) and visual parameters
 * @param {string} mode - game input/playthrough mode ['sim', 'p1-vs-sim', 'sim-vs-p2', 'p1-vs-p2']
 * @param {CanvasSpace} space - CanvasSpace from pts for the game to illustrate on
 */
ScalarQuadraticGame.setupGame = function (parameters, mode, space) {
    this.init(parameters);
    this.history = new Group();
    this.historyIndex = [];
    this.mode = mode;
    this.space = space;
    this.playerOne = Object.create(QuadraticMachineX);
    this.playerTwo = Object.create(QuadraticMachineY);
    this.currentAction = [parameters.gameplayParameters.x0, parameters.gameplayParameters.y0];

    this.playerOne.createPlayer(parameters.gameplayParameters, this.currentAction[0]);
    this.playerTwo.createPlayer(parameters.gameplayParameters, this.currentAction[1]);
};

/**
 * Initializes a new game loop given the current game configuration
 */
ScalarQuadraticGame.startNewGameLoop = function () {
    var controller = this._generateGameController();
    this.space.removeAll();
    this.space.add(controller);
    this.space.bindMouse().bindTouch().play();
}

/**
 * @param {object} parameters - All gameplay and visual parameters for the new game loop
 */
ScalarQuadraticGame.updateParameters = function(parameters) {
    this.parameters = parameters;

    parameters.gameplayParameters.x0 = this.currentAction[0];
    parameters.gameplayParameters.y0 = this.currentAction[1];

    this.playerOne.createPlayer(parameters.gameplayParameters, parameters.gameplayParameters.x0);
    this.playerTwo.createPlayer(parameters.gameplayParameters, parameters.gameplayParameters.y0);
    
    var newHistory = new Group();
    this.historyIndex.push(newHistory);
    this.history = newHistory;
}

/**
 * Steps the game forward one timestep
 */
ScalarQuadraticGame._step = function () {
    // Get mouse input
    var x_in = 0;
    var y_in = 0;

    var { currentAction } = this;


    var nextAction = this._calculateNextAction(currentAction[0], currentAction[1], x_in, y_in);
    this.currentAction = nextAction;
    this.dataPoints.push(currentAction);
};

/**
 * Generates an IPlayer object to be added to a CanvasSpace, controls how internal data/costs/actions map
 * to game interface
 * @returns {IPlayer} - returns an IPlayer that encodes info about game dynamics, to be added to
 * a CanvasSpace
 */
ScalarQuadraticGame._generateGameController = function () {
    const yCenter = document.getElementById("gameplay-window-total").offsetHeight / 2;
    const xCenter = document.getElementById("gameplay-window-total").offsetWidth / 2;

    function toScreen(pt) {
        var x = pt.x;
        var y = pt.y;

        return new Pt(x * visualScale + xCenter, -y * visualScale + yCenter);
    }

    //Since each player is an object that we add to the space, it's possible we can make each player their own object
    //could lead to some more interesting dynamics?
    var { visualScale, PLAYER_ACTION_RADIUS, COLOR_P1, COLOR_P2 } = this.parameters.visualParameters;
    var ancillaryGameInformation = {};

    //Better solution would be to randomly generate hex numbers #XXXX00 
    const PATH_COLORS = ["#95e1d3", "#eaffd0", "#fce38a", "#f38181", "#639fab", "fcf300", "eb5160", "b7999c"];

    //Origin and current action circles
    var form = this.space.getForm();

    //Not an ideal operation but fixes bug -- force-setting form canvas contex to be space ctx
    form._ctx = this.space.ctx;

    return {
        start: (bound) => {
            this.history = new Group();
            this.historyIndex.push(this.history);
            ancillaryGameInformation = this._createPtsFunctionVisualizations(this.space);
        },

        animate: (time, ftime) => {
            if (!ancillaryGameInformation.vectorfield) {
                ancillaryGameInformation = this._createPtsFunctionVisualizations(this.space);
            }

            this._step();
            var newPt = new Pt(this.currentAction);
            this.history.push(newPt);
            var {br1, br2, origin, vectorfield, vectorfield_pts} = ancillaryGameInformation;
            var currentAction = Circle.fromCenter(toScreen(newPt), PLAYER_ACTION_RADIUS);
            form.strokeOnly(COLOR_P1, 2).line(br1);
            form.strokeOnly(COLOR_P2, 2).line(br2);
            form.fillOnly("#fff").circle(origin);
            form.fill("#000").circle(currentAction);
            form.strokeOnly("#ccc", 1).lines(vectorfield);
            form.fillOnly("#ccc").points(vectorfield_pts, 1);

            for (let i = 0; i < this.historyIndex.length; i++) {
                form.strokeOnly(PATH_COLORS[i % PATH_COLORS.length], 2).line((this.historyIndex[i]).map((p) => toScreen(p)));
            }
        },
    }
}

/**
 * Returns the fixed point of the quadratic game
 * @returns {Array} [x, y] of the fixed point of the system
 */
ScalarQuadraticGame._fixedPoint = function () {
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
ScalarQuadraticGame._calculateNextAction = function (x, y, x_in = 0, y_in = 0) {
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

ScalarQuadraticGame._createPtsFunctionVisualizations = function (space) {
    // Transformation functions
    function fromScreen(pt) {
        var x = pt.x;
        var y = pt.y;

        return new Pt((x - xCenter) / visualScale, -(y - yCenter) / visualScale);
    }

    function toScreen(pt) {
        var x = pt.x;
        var y = pt.y;

        return new Pt(x * visualScale + xCenter, -y * visualScale + yCenter);
    }

    const yCenter = document.getElementById("gameplay-window-total").offsetHeight / 2;
    const xCenter = document.getElementById("gameplay-window-total").offsetWidth / 2;

    var { barrier, isSimulating } = this.parameters.gameplayParameters;
    var { ORIGIN_RADIUS, PLAYER_ACTION_RADIUS, visualScale, vectorFieldScale, ORIGIN_RADIUS } = this.parameters.visualParameters;

    var br1, br2;
    var fixed, origin;
    var currentAction;
    var vectorfield, vectorfield_pts;

    var xmin = -1 * barrier; // autodetect this
    var xmax = barrier;  // 
    var ymin = -1 * barrier;
    var ymax = barrier;

    br1 = Group.fromArray([toScreen(new Pt(this.playerOne.bestResponse(ymin), ymin)),
    toScreen(new Pt(this.playerOne.bestResponse(ymax), ymax))]);
    br2 = Group.fromArray([toScreen(new Pt(xmin, this.playerTwo.bestResponse(xmin))),
    toScreen(new Pt(xmax, this.playerTwo.bestResponse(xmax)))]);
    fixed = new Pt(this._fixedPoint());
    origin = Circle.fromCenter(toScreen(fixed.x, fixed.y), ORIGIN_RADIUS);
    currentAction = Circle.fromCenter(toScreen(new Pt(this.currentAction)), PLAYER_ACTION_RADIUS);

    vectorfield = Create.gridPts(space.innerBound, 30, 30).map(
        (p) => {

            let q, dx, dy, norm;
            q = fromScreen(p);
            dx = this.playerOne.update(q.x, q.y);
            dy = this.playerTwo.update(q.x, q.y);
            norm = Math.sqrt(dx * dx + dy * dy);
            dy /= norm * vectorFieldScale;
            if (this.mode === 'sim') {
                dx /= norm * vectorFieldScale;
            } else {
                dx = 0;
            }

            return new Group(p, p.$add(new Pt(dx * visualScale, -dy * visualScale)));
        });

    vectorfield_pts = Create.gridPts(space.innerBound, 30, 30);

    return { br1, br2, origin, currentAction, vectorfield, vectorfield_pts };
}

export { ScalarQuadraticGame };