import { ScalarQuadraticGame } from '../systems/QuadraticGame/ScalarQuadraticGame.js';
import { DEFAULT_GAMEPLAY_PARAMETERS, DEFAULT_VISUAL_PARAMETERS, DEFAULT_SIMULATION_SETTING } from '../systems/default-parameters.js';
Pts.namespace(window);

window.addEventListener('load', function initializeGameLoop(event) {
    var space = initCanvas();

    //markers for game changes/updates in one sitting
    var history = new Group();

    //experimental stuff - need to update for better coding practices
    var historyIndex = [];
    const PATH_COLORS = ["#95e1d3", "#eaffd0", "#fce38a", "#f38181"];

    //Load parameters
    var parameters = initializeParameters();
    var GameState = Object.create(ScalarQuadraticGame);
    var controller = game_loop(space);
    
    initializeParameterForm();
    GameState.setupGame(parameters, 'sim');
    loadGameController(controller);

    const parameterForm = document.getElementById("parameter-form");

    parameterForm.onchange = function () {
        numberGameStateChanges++;
        history = new Group();
        historyIndex.push(history);

        var lastAction = GameState.currentAction;
        var xLast = lastAction[0];
        var yLast = lastAction[1];

        parameters = loadGameParametersFromForm();
        parameters.gameplayParameters.x0 = xLast;
        parameters.gameplayParameters.y0 = yLast

        GameState = Object.create(ScalarQuadraticGame);
        GameState.setupGame(parameters, 'sim');

        space.removeAll();
        var newController = game_loop(space);
        loadGameController(newController);
    }

    function loadGameController(controller) {
        space.add(controller);
        // bind mouse events and play animation
        space.bindMouse().bindTouch().play();
    };

    function game_loop(space) {
        var br1, br2;
        var fixed, origin;
        var currentAction;
        var vectorfield, vectorfield_pts;

        function loadGameVisuals() {
            var xmin = -1 * barrier; // autodetect this
            var xmax = barrier;  // 
            var ymin = -1 * barrier;
            var ymax = barrier;

            br1 = Group.fromArray([toScreen(new Pt(GameState.playerOne.bestResponse(ymin), ymin)),
            toScreen(new Pt(GameState.playerOne.bestResponse(ymax), ymax))]);
            br2 = Group.fromArray([toScreen(new Pt(xmin, GameState.playerTwo.bestResponse(xmin))),
            toScreen(new Pt(xmax, GameState.playerTwo.bestResponse(xmax)))]);
            fixed = new Pt(GameState.fixedPoint());
            origin = Circle.fromCenter(toScreen(fixed.x, fixed.y), ORIGIN_RADIUS);
            currentAction = Circle.fromCenter(toScreen(new Pt(GameState.currentAction)), PLAYER_ACTION_RADIUS);
            vectorfield = Create.gridPts(space.innerBound, 30, 30).map(
                (p) => {

                    let q, dx, dy, norm;
                    q = fromScreen(p);
                    dx = GameState.playerOne.update(q.x, q.y);
                    dy = GameState.playerTwo.update(q.x, q.y);
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
        }

        const yCenter = document.getElementById("gameplay-window-total").offsetHeight / 2;
        const xCenter = document.getElementById("gameplay-window-total").offsetWidth / 2;

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

        //Since each player is an object that we add to the space, it's possible we can make each player their own object
        //could lead to some more interesting dynamics?
        var { barrier, isSimulating } = parameters.gameplayParameters;
        var { visualScale, vectorFieldScale, ORIGIN_RADIUS, PLAYER_ACTION_RADIUS, COLOR_P1, COLOR_P2 } = parameters.visualParameters;

        //Origin and current action circles
        var form = space.getForm();

        //Not an ideal operation but fixes bug -- force-setting form canvas contex to be space ctx
        form._ctx = space.ctx;

        return {
            start: (bound) => {
                loadGameVisuals();
                history = new Group();
                historyIndex.push(history);
            },

            animate: (time, ftime) => {
                if (!vectorfield) {
                    loadGameVisuals();
                }

                GameState.step();
                var newPt = new Pt(GameState.currentAction);
                history.push(newPt);

                currentAction = Circle.fromCenter(toScreen(newPt), PLAYER_ACTION_RADIUS);

                form.strokeOnly(COLOR_P1, 2).line(br1);
                form.strokeOnly(COLOR_P2, 2).line(br2);
                form.fillOnly("#fff").circle(origin);
                form.fill("#000").circle(currentAction);
                form.strokeOnly("#ccc", 1).lines(vectorfield);
                form.fillOnly("#ccc").points(vectorfield_pts, 1);
                for (let i = 0; i < historyIndex.length; i++) {
                    form.strokeOnly(PATH_COLORS[i], 2).line((historyIndex[i]).map((p) => toScreen(p)));
                }
            },
        }
    }
})

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

//Helper functions
//Attaches listeners to buttons and keyboard for toggle events (loading parameters, starting game,
//triggering simulations.)

//Creates a Pts space and canvas.
function initCanvas() {
    var space = new CanvasSpace("#pt").setup({
        bgcolor: "#345", resize: true, retina: true
    });
    return space;
}

//Loads parameters from sessionStorage into variables, and updates fields of parameter forms to those values.
//If sessionStorage doesn't contain any data about parameters, the default params are loaded and used instead.
function initializeParameters() {
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

    return { gameplayParameters, visualParameters };
}

function initializeParameterForm() {
    var gameplayParameters = JSON.parse(sessionStorage.getItem("gameplayParameters"));
    var visualParameters = JSON.parse(sessionStorage.getItem("visualParameters"));

    for (let [parameter, value] of Object.entries(gameplayParameters)) {
        document.getElementById("parameter-" + parameter).setAttribute("value", value);
    }

    for (let [parameter, value] of Object.entries(visualParameters)) {
        document.getElementById("parameter-" + parameter).setAttribute("value", value);
    }
}

//reloads game and visual parameters upon form submit.
function loadGameParametersFromForm() {
    const parameterForm = document.getElementById("parameter-form");
    let FD = new FormData(parameterForm);

    var gameplayParameters = JSON.parse(sessionStorage.getItem("gameplayParameters"));
    var visualParameters = JSON.parse(sessionStorage.getItem("visualParameters"));

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

    return {
        gameplayParameters,
        visualParameters
    }
}
