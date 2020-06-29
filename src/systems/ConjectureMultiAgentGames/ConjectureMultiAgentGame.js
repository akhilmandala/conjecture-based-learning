

var Game = {
    //Gameplay/calculation control methods
    init: function ({ playerOne, playerTwo }) {
        this.dataIndex = [];

        this.historyIndex = [];
        this.history = new Group();
        this.historyIndex[0] = this.history;

        this.dataPoints = [];

        this.playerOne = Object.create(playerOne);
        this.playerTwo = Object.create(playerTwo);

        this.osc = new Tone.Oscillator({
            "frequency": 261.626,
            "type": "triangle4",
            "volume": -40
        }).toMaster();

        this.osc.start();
    },
    startGameLoop: function ({ parameters, mode }) {
        this.parameters = parameters;
        this.mode = mode;
        this.currentAction = [parameters.x0, parameters.y0];

        this.playerOne.createPlayer(parameters, this.currentAction[0]);
        this.playerTwo.createPlayer(parameters, this.currentAction[1]);

        this._instantiateGameVisuals();
    },
    endGame: function () {
        this._addCurrentGameHistoryToData();
        this.space.removeAll();
        return this.dataIndex;
    },
    updateParameters: function (parameters) {
        //push current parameters and history
        this._addCurrentGameHistoryToData();

        this.parameters = parameters;
        parameters.x0 = this.currentAction[0];
        parameters.y0 = this.currentAction[1];

        this.playerOne.createPlayer(parameters, parameters.x0);
        this.playerTwo.createPlayer(parameters, parameters.y0);

        var newHistory = new Group();
        this.historyIndex.push(newHistory);
        this.history = newHistory;

        this.dataPoints = [];
    },
    launchExperiment: function ({ numberOfTrials, trialDuration, mode, parameterSets }) {
        this.startGameLoop({
            parameters: parameterSets[0],
            mode: mode
        });
        for (let i = 1; i <= numberOfTrials; i++) {
            var self = this;
            setTimeout(function () {
                self.updateParameters(parameterSets[i % parameterSets.length]);
            }, i * trialDuration);
        }
    },
    *actionUpdateIO() {
        var x_out, y_out, dt = 0.02;
        var [x, y] = this.currentAction;
        var converter = this._dataToVisualizationConverter();

        try {
            //find x_outout
            if ((this.mode === 'p1-vs-sim') || this.mode === 'p1-vs-p2') {
                x_out = converter.fromScreen(this.space.pointer.x, 0)[0];
            } else {
                x_out = x - dt * this.playerOne.update(x, y);
            }
            yield x_out;

            //find y_output
            if ((this.mode === 'sim-vs-p2') || (this.mode === 'p1-vs-p2')) {
                y_out = converter.fromScreen(0, this.space.pointer.y);
            } else {
                y_out = y - dt * this.playerTwo.update(x, y);
            }
            yield y_out;

            this.currentAction = [x_out, y_out];
            this.dataPoints.push([performance.now(), this.parameters['d'], x_out, y_out]);

            var cost_p1 = this.playerOne.cost(x, y);
            var freq = 100 * Math.abs(cost_p1) + 220;
            // var freq = 50*math.log(1000 * (f1+50));
            // var freq = math.exp(f1/10)+440;j
            // console.log("cost: "+f1);
            // console.log("freq: "+freq);
            this.osc.frequency.rampTo(freq, 10 / 1000);
        } catch (err) {
            console.log(err);
            //todo: handle error with some kind of page refresh
        }
    },
    _step: function () {
        var step_iterator = this.actionUpdateIO();

        //start current action calculations
        var x_out = step_iterator.next().value;
        if (isNaN(x_out)) {
            step_iterator.throw("failed to calculate x_output");
        }

        var y_out = step_iterator.next().value;
        if (isNaN(y_out)) {
            step_iterator.throw("failed to calculate y_output");
        }

        step_iterator.next();
    },
    _addCurrentGameHistoryToData: function addGameToHistory() {
        this.dataIndex.push({
            id: Math.random(),
            payload: {
                dataPoints: this.dataPoints,
                parameters: this.parameters,
            }
        })
    },
    //Visualization methods
    setupSpace: function ({ space, visualParameters }) {
        this.space = space;
        this.form = space.getForm();
        this.form._ctx = space.ctx;
        this.visualParameters = visualParameters;
    },
    _dataToVisualizationConverter: function () {
        const yCenter = this.space.height / 2;
        const xCenter = this.space.width / 2;
        const { visualScale } = this.visualParameters;

        function fromScreen(x, y) {
            return [(x - xCenter) / visualScale, -(y - yCenter) / visualScale];
        }

        function toScreen(x, y) {
            return [x * visualScale + xCenter, -y * visualScale + yCenter];
        }

        return {
            fromScreen: fromScreen,
            toScreen: toScreen
        };
    },
    _generateGameIPlayer: function () {
        return {
            start: this._start_animation.bind(this),
            animate: this._animate.bind(this)
        }
    },
    _start_animation: function start() {
        this.history = new Group();
        this.historyIndex.push(this.history);
        this.gameFeatureVisualizations = this._createFeatureVisualizations(this.space);
    },
    _animate: function animate() {
        var { PLAYER_ACTION_RADIUS, COLOR_P1, COLOR_P2 } = this.visualParameters;
        var converter = this._dataToVisualizationConverter();
        const PATH_COLORS = ["#95e1d3", "#eaffd0", "#fce38a", "#f38181", "#639fab", "fcf300", "eb5160", "b7999c"];

        if(this.history.length == 0) {
            this.gameFeatureVisualizations = this._createFeatureVisualizations(this.space);
        }

        this._step();
        var [x, y] = this.currentAction;

        var { br1, br2, vectorfield, vectorfield_pts } = this.gameFeatureVisualizations;
        var currentAction = Circle.fromCenter(new Pt(converter.toScreen(x, y)), PLAYER_ACTION_RADIUS);

        this.history.push(this.currentAction);

        this.form.strokeOnly(COLOR_P1, 2).line(br1);
        this.form.strokeOnly(COLOR_P2, 2).line(br2);
        this.form.fill("#000").circle(currentAction);
        this.form.strokeOnly("#ccc", 1).lines(vectorfield);
        this.form.fillOnly("#ccc").points(vectorfield_pts, 1);

        for (let i = 0; i < this.historyIndex.length; i++) {
            this.form.strokeOnly(PATH_COLORS[i % PATH_COLORS.length], 2).line((this.historyIndex[i]).map(([x, y]) => new Pt(converter.toScreen(x, y))));
        }
    },
    _createFeatureVisualizations: function (space) {
        var converter = this._dataToVisualizationConverter();

        var { PLAYER_ACTION_RADIUS, visualScale, vectorFieldScale } = this.visualParameters;

        var xmin = -100; // autodetect this
        var xmax = 100;  // 
        var ymin = -100;
        var ymax = 100;

        var br1 = Group.fromArray([new Pt(converter.toScreen(this.playerOne.bestResponse(ymin), ymin)),
        new Pt(converter.toScreen(this.playerOne.bestResponse(ymax), ymax))]);

        // var x_steps = math.range(xmin, xmax, 0.1);
        // var br1 = Group.fromArray(x_steps.map((x)=> toScreen(new Pt(x, this.playeOne.bestResponseInv(x)))))    

        var br2 = Group.fromArray([new Pt(converter.toScreen(xmin, this.playerTwo.bestResponse(xmin))),
        new Pt(converter.toScreen(xmax, this.playerTwo.bestResponse(xmax)))]);

        var currentAction = Circle.fromCenter(new Pt(converter.toScreen(...this.currentAction)), PLAYER_ACTION_RADIUS);

        var vectorfield = Create.gridPts(space.innerBound, 30, 30).map((p) => {
            let q, dx, dy, norm;
            q = converter.fromScreen(p.x, p.y);
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
    _instantiateGameVisuals: function() {
        var controller = this._generateGameIPlayer();
        this.space.removeAll();
        this.space.add(controller);
        this.space.bindMouse().bindTouch().play();
    }
}

var Player = {
    init: function init({ parameters, operator }) {
        this.parameters = parameters;
        this.operator = operator;
    },
    attachSpace: function attachSpace(space) {
        this.space = space;
    },
}

export { Game, Player };