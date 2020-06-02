import { ScalarQuadraticGame } from '../systems/quadratic.js';
import { DEFAULT_GAMEPLAY_PARAMETERS, DEFAULT_VISUAL_PARAMETERS, DEFAULT_SIMULATION_SETTING } from '../systems/default-parameters.js';
Pts.namespace(window);

window.addEventListener('load', function initializeGameLoop(event) {
    var space = initCanvas();
    // var synth = new Tone.Synth().toMaster();
    // TODO: fix cost => frequency mapping, implementation 
    // var osc = initOscillator();

    //Load parameters
    var parameters = initializeParametersAndParameterForm();
    var gameplayParameters = parameters[0];
    var visualParameters = parameters[1];

    // TODO: transfer animation gameplay rules to the object (ideally, only "drawing" is in this file)
    var GameState = new ScalarQuadraticGame(gameplayParameters, visualParameters);

    attachListeners();
    var controller = GameState.game_loop(space);

    //TODO: fix loading game controller upon start button
    //Adds controller object to space. controller object encodes animation and update functions.
    (function loadGameController(controller) {
        space.add(controller);
        // bind mouse events and play animation
        space.bindMouse().bindTouch().play();
    })(controller);

    //TODO: move function and required imports/variables into Game class (makes platform more responsive?)
    //Generates and returns an IPlayer object for Pts, which encodes update functions and animation functions.
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
}