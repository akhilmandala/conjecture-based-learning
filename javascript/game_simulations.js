import { ScalarQuadraticGame } from '../systems/quadratic.js';
import { DEFAULT_GAMEPLAY_PARAMETERS, DEFAULT_VISUAL_PARAMETERS, DEFAULT_SIMULATION_SETTING } from '../systems/default-parameters.js';
Pts.namespace(window);

window.addEventListener('load', function initializeGameLoop(event) {
    var space = initCanvas();
    var synth = new Tone.Synth().toMaster();
    // TODO: fix cost => frequency mapping, implementation 
    // var osc = initOscillator();
    var isSimulating = true;
    var form = space.getForm();

    //Load parameters
    var parameters = initializeParametersAndParameterForm();
    var gameplayParameters = parameters[0];
    var visualParameters = parameters[1];

    attachListeners();
    var controller = game_loop(gameplayParameters, visualParameters);

    //TODO: move this function call into a listener
    loadGameController(controller);

    //Helper functions

    //Attaches listeners to buttons and keyboard for toggle events (loading parameters, starting game,
    //triggering simulations.)
    function attachListeners() {
        //Set parameter values

        const parameterForm = document.getElementById("parameter-form");
        parameterForm.addEventListener('submit', function (event) {
            loadGameParameters();
        });

        const startGameButton = document.getElementById("start-game");
        startGameButton.addEventListener('click', function () {
            console.log("pressed");
            loadGameController(controller);
        });

        document.addEventListener('keyup', function (event) {
            if (event.ctrlKey && event.key === 't') {
                event.preventDefault();
                isSimulating = !isSimulating;
                console.log(isSimulating)
            } else if (event.ctrlKey && event.key === 'b') {
                event.preventDefault();
            }
        });
    }

    //Loads parameters from sessionStorage into variables, and updates fields of parameter forms to those values.
    //If sessionStorage doesn't contain any data about parameters, the default params are loaded and used instead.
    function initializeParametersAndParameterForm() {
        var gameplayParameters, visualParameters;
        if (sessionStorage.getItem("gameplayParameters") === null) {
            //First time page is being loaded, set the parameters to default
            sessionStorage.setItem("gameplayParameters", JSON.stringify(DEFAULT_GAMEPLAY_PARAMETERS));
        }

        if (sessionStorage.getItem("visualParameters") === null) {
            sessionStorage.setItem("visualParameters", JSON.stringify(DEFAULT_VISUAL_PARAMETERS));
        }

        gameplayParameters = JSON.parse(sessionStorage.getItem("gameplayParameters"));
        visualParameters = JSON.parse(sessionStorage.getItem("visualParameters"));

        for (let [parameter, value] of Object.entries(gameplayParameters)) {
            document.getElementById("parameter-" + parameter).setAttribute("value", value);
        }

        for (let [parameter, value] of Object.entries(visualParameters)) {
            document.getElementById("parameter-" + parameter).setAttribute("value", value);
        }

        return [gameplayParameters, visualParameters];
    }

    //reloads game and visual parameters upon form submit.
    function loadGameParameters() {
        const parameterForm = document.getElementById("parameter-form");
        let FD = new FormData(parameterForm);

        gameplayParameters = JSON.parse(sessionStorage.getItem("gameplayParameters"));
        visualParameters = JSON.parse(sessionStorage.getItem("visualParameters"));
        for (var key of Object.keys(gameplayParameters)) {
            gameplayParameters[key] = parseFloat(FD.get(key));
            document.getElementsByName(key)[0].value = FD.get(key);
        }
        for (var key of Object.keys(visualParameters)) {
            gameplayParameters[key] = parseFloat(FD.get(key));
            document.getElementsByName(key)[0].value = FD.get(key);
        }
        sessionStorage.setItem("gameplayParameters", JSON.stringify(gameplayParameters));
        sessionStorage.setItem("visualParameters", JSON.stringify(visualParameters));
    }

    //TODO: fix loading game controller upon start button
    //Adds controller object to space. controller object encodes animation and update functions.
    function loadGameController(controller) {
        space.add(controller);
        // bind mouse events and play animation
        space.bindMouse().bindTouch().play();
    }

    //Creates a Pts space and canvas.
    function initCanvas() {
        var space = new CanvasSpace("#pt").setup({
            bgcolor: "#345", resize: true, retina: true
        });
        return space;
    }

    //TODO: map cost function to oscillator better.
    //Creates an Tone oscillator
    function initOscillator() {
        synth.triggerAttack("C4");
        var osc = new Tone.Oscillator({
            "frequency": 261.626,
            "type": "sawtooth10",
            "volume": -60
        }).toMaster();
        osc.start();
        return osc;
    }

    //TODO: move function and required imports/variables into Game class (makes platform more responsive?)
    //Generates and returns an IPlayer object for Pts, which encodes update functions and animation functions.
    function game_loop(gameplayParameters = DEFAULT_GAMEPLAY_PARAMETERS, visualParameters = DEFAULT_VISUAL_PARAMETERS) {
        //Since each player is an object that we add to the space, it's possible we can make each player their own object
        //could lead to some more interesting dynamics?

        // TODO: Link constant parameters to HTML doc
        const HEIGHT = document.getElementById("gameplay-window-total").offsetHeight;
        const WIDTH = document.getElementById("gameplay-window-total").offsetWidth;
        const ORIGIN_RADIUS = 10;
        const PLAYER_ACTION_RADIUS = 5;
        const COLOR_P1 = "#e63946";
        const COLOR_P2 = "#ffba08";

        var { x0, y0, barrier } = gameplayParameters;
        var { timeScale, visualScale, vectorFieldScale } = visualParameters;

        // Centers of canvas, updated at init
        var yCenter = HEIGHT / 2;
        var xCenter = WIDTH / 2;
        // Starting conditions
        var x = x0;
        var y = y0;
        // Object to trace taken path
        var history = new Group();
        // Overall game project
        // TODO: transfer animation gameplay rules to the object (ideally, only "drawing" is in this file)
        var GameState = new ScalarQuadraticGame(gameplayParameters);

        //TODO: Transfer below variables into QuadraticGameFile
        //Drawing stable lines
        var xmin = -1 * barrier; // autodetect this
        var xmax = barrier;  // 
        var ymin = -1 * barrier;
        var ymax = barrier;

        //Origin and current action circles
        var fixed;
        var br1, br2;
        var currentAction;
        var origin;

        var vectorfield, vectorfield_pts;

        br1 = Group.fromArray([toScreen(GameState.player1.bestresponse1(ymin), ymin),
        toScreen(GameState.player1.bestresponse1(ymax), ymax)]);
        br2 = Group.fromArray([toScreen(xmin, GameState.player2.bestresponse2(xmin)),
        toScreen(xmax, GameState.player2.bestresponse2(xmax))]);

        fixed = new Pt(GameState.fixedPoint());

        origin = Circle.fromCenter(toScreen(fixed.x, fixed.y), ORIGIN_RADIUS);

        currentAction = Circle.fromCenter(toScreen(x, y), PLAYER_ACTION_RADIUS);

        const GameExecutionController = {
            start: (bound) => {
                y = y0;
                x = x0;

                vectorfield = Create.gridPts(space.innerBound, 30, 30).map(
                    (p) => {
                        let q, dx, dy, norm;
                        q = fromScreen(p.x, p.y);
                        dx = GameState.advanceP1(q.x, q.y);
                        dy = GameState.advanceP2(q.x, q.y);
                        norm = Math.sqrt(dx * dx + dy * dy);
                        dy /= norm * vectorFieldScale;
                        if (isSimulating) {
                            dx /= norm * vectorFieldScale;
                        } else {
                            dx = 0;
                        }

                        return new Group(p, p.$add(new Pt(dx * visualScale, -dy * visualScale)));
                    });

                vectorfield_pts = Create.gridPts(space.innerBound, 30, 30);
            },

            animate: (time, ftime) => {
                // Adaptive time scale (TODO: measure the distribution of ftime)
                var dt = ftime * timeScale;
                var input = getMouse(space.pointer);

                if (isSimulating) { // both players simulate
                    x = x - dt * GameState.advanceP1(x, y);
                    y = y - dt * GameState.advanceP2(x, y);
                } else if (!isSimulating) { // player 1 is human
                    x = input.x;
                    y = y - dt * GameState.advanceP2(x, y);
                } else { // TODO: replace toggle_simulation with simulation_mode and add the following case
                    x = x - dt * GameState.advanceP1(x, y);
                    y = input.y;
                }

                history.push(new Pt(x, y));
                currentAction = Circle.fromCenter(toScreen(x, y), PLAYER_ACTION_RADIUS);

                // tone frequency control => player 1 cost function 
                // TODO: fix
                // var f1 = GameState.player1.cost1(x, y);
                // osc.frequency.rampTo(261 - outputScale * f1, ftime / 1000);

                // Draw best response lines
                form.strokeOnly(COLOR_P1, 2).line(br1);
                form.strokeOnly(COLOR_P2, 2).line(br2);

                //creates origin
                form.fillOnly("#fff").circle(origin);
                form.fill("#000").circle(currentAction);

                form.strokeOnly("#ccc", 1).lines(vectorfield);
                form.fillOnly("#ccc").points(vectorfield_pts, 1);
                form.strokeOnly("#888", 1).line(history.map((p) => toScreen(p.x, p.y)));
            },
        }

        return GameExecutionController;

        //Helper functions
        // Transformation functions
        function fromScreen(x, y) {
            return new Pt((x - xCenter) / visualScale, -(y - yCenter) / visualScale);
        }

        function toScreen(x, y) {
            return new Pt(x * visualScale + xCenter, -y * visualScale + yCenter);
        }

        // Get mouse position 
        function getMouse(pointer) {
            return fromScreen(pointer.x, pointer.y);
        }
    }
})