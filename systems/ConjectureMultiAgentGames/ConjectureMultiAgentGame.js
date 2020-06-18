/**
 * TODO:
 * - spawn Worker to deal with agent calculations
 */

var Game = {
    init: function (parameters, mode = 'sim', playerOne, playerTwo) {
        this.parameters = parameters;
        this.dataIndex = [];

        this.mode = mode;
        this.currentAction = [parameters.gameplayParameters.x0, parameters.gameplayParameters.y0];

        this.historyIndex = [];
        this.history = new Group();
        this.historyIndex[0] = this.history;

        this.dataPoints = [];

        this.playerOne = Object.create(playerOne);
        this.playerTwo = Object.create(playerTwo);

        this.playerOne.createPlayer(parameters.gameplayParameters, this.currentAction[0]);
        this.playerTwo.createPlayer(parameters.gameplayParameters, this.currentAction[1]);
    },
    setupSpace: function (space) {
        this.space = space;
        this.form = space.getForm();
        this.form._ctx = space.ctx;
    },
    startGameLoop: function () {
        var controller = this._generateGameIPlayer();
        this.space.removeAll();
        this.space.add(controller);
        this.space.bindMouse().bindTouch().play();
    },
    endGame: function () {
        this._addCurrentGameHistoryToData();
        this.space.removeAll();
        return this.dataIndex;
    },
    updateParameters: function () {
        //push current parameters and history
        this._addCurrentGameHistoryToData();

        this.parameters = parameters;
        parameters.gameplayParameters.x0 = this.currentAction[0];
        parameters.gameplayParameters.y0 = this.currentAction[1];

        this.playerOne.createPlayer(parameters.gameplayParameters, parameters.gameplayParameters.x0);
        this.playerTwo.createPlayer(parameters.gameplayParameters, parameters.gameplayParameters.y0);

        var newHistory = new Group();
        this.historyIndex.push(newHistory);
        this.history = newHistory;

        this.dataPoints = [];
    },
    _createFeatureVisualizations: function(space) {
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
    
        var { barrier, isSimulating } = this.parameters.gameplayParameters;
        var { ORIGIN_RADIUS, PLAYER_ACTION_RADIUS, visualScale, vectorFieldScale, ORIGIN_RADIUS } = this.parameters.visualParameters;
    
        var xmin = -1 * barrier; // autodetect this
        var xmax = barrier;  // 
        var ymin = -1 * barrier;
        var ymax = barrier;
    
        const yCenter = document.getElementById("gameplay-window-total").offsetHeight / 2;
        const xCenter = document.getElementById("gameplay-window-total").offsetWidth / 2;
    
        var br1 = Group.fromArray([toScreen(new Pt(this.playerOne.bestResponse(ymin), ymin)),
        toScreen(new Pt(this.playerOne.bestResponse(ymax), ymax))]);
    
        var br2 = Group.fromArray([toScreen(new Pt(xmin, this.playerTwo.bestResponse(xmin))),
        toScreen(new Pt(xmax, this.playerTwo.bestResponse(xmax)))]);
    
        var currentAction = Circle.fromCenter(toScreen(new Pt(this.currentAction)), PLAYER_ACTION_RADIUS);
    
        var vectorfield = Create.gridPts(space.innerBound, 30, 30).map(
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
    
        var vectorfield_pts = Create.gridPts(space.innerBound, 30, 30);
    
        return { br1, br2, origin, currentAction, vectorfield, vectorfield_pts };
    },
    _step: function() {
        // Get mouse input
        var x_in = 0;
        var y_in = 0;

        var [x, y] = this.currentAction;

        var currentAction = this.currentAction;

        let dt = 0.02;

        var x_out, y_out;
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

        this.dataPoints.push(currentAction);
        this.currentAction = [x_out, y_out];
    },
    _generateGameIPlayer: function() {
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
    
        return {
            start: (bound) => {
                this.history = new Group();
                this.historyIndex.push(this.history);
                ancillaryGameInformation = this._createFeatureVisualizations(this.space);
            },
    
            animate: (time, ftime) => {
                if (this.history.length === 0) {
                    ancillaryGameInformation = this._createFeatureVisualizations(this.space);
                }
    
                this._step();
                var newPt = new Pt(this.currentAction);
                this.history.push(newPt);
                this.dataPoints.push([newPt.x, newPt.y]);
                var {br1, br2, origin, vectorfield, vectorfield_pts} = ancillaryGameInformation;
                var currentAction = Circle.fromCenter(toScreen(newPt), PLAYER_ACTION_RADIUS);
                this.form.strokeOnly(COLOR_P1, 2).line(br1);
                this.form.strokeOnly(COLOR_P2, 2).line(br2);
                this.form.fill("#000").circle(currentAction);
                this.form.strokeOnly("#ccc", 1).lines(vectorfield);
                this.form.fillOnly("#ccc").points(vectorfield_pts, 1);
    
                for (let i = 0; i < this.historyIndex.length; i++) {
                    this.form.strokeOnly(PATH_COLORS[i % PATH_COLORS.length], 2).line((this.historyIndex[i]).map((p) => toScreen(p)));
                }
            },
        }
    }
}

var Player = {
    init: function init(parameters) {
        this.parameters = parameters;
    },
}

export { Game, Player };