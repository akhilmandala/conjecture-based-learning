import { ScalarQuadraticGame } from '../systems/QuadraticGame/ScalarQuadraticGame.js';
import { DEFAULT_GAMEPLAY_PARAMETERS, DEFAULT_VISUAL_PARAMETERS, DEFAULT_SIMULATION_SETTING } from '../systems/default-parameters.js';
Pts.namespace(window);

var GameState = Object.create(ScalarQuadraticGame);

window.addEventListener('load', function initializeGameLoop(event) {
    var space = initCanvas();
    //Load parameters
    var parameters = initializeParameters();
    GameState.setupGame(parameters, 'sim', space);
    GameState.startNewGameLoop();
})

const parameterForm = document.getElementById("parameter-form");
parameterForm.onchange = function () {
    var parameters = loadGameParametersFromForm();
    GameState.updateParameters(parameters);
    GameState.startNewGameLoop();
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

    for (let [parameter, value] of Object.entries(gameplayParameters)) {
        document.getElementById("parameter-" + parameter).setAttribute("value", value);
    }

    for (let [parameter, value] of Object.entries(visualParameters)) {
        document.getElementById("parameter-" + parameter).setAttribute("value", value);
    }

    return { gameplayParameters, visualParameters };
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
