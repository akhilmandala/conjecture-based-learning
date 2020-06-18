import {QuarticGame} from '../systems/ConjectureMultiAgentGames/QuarticGame/QuarticGame.js'
import DEFAULT_PARAMETERS from '../systems/ConjectureMultiAgentGames/QuarticGame/default-parameters.js';
Pts.namespace(window);

var GameState = Object.create(QuarticGame);
var space = initCanvas();
var parameters = DEFAULT_PARAMETERS.quarticGameParameters;

window.addEventListener('load', function(event) {
    GameState.setupSpace(space);
})

const parameterForm = document.getElementById("parameter-form");
parameterForm.onchange = function () {
    var parameters = loadGameParametersFromForm();
    GameState.updateParameters(parameters);
    GameState.startNewGameLoop();
}

const startGameButton = document.getElementById("start-game");
startGameButton.addEventListener("click", function (event) {
    event.preventDefault();
    GameState.setupGame(parameters, 'sim');
    GameState.startGameLoop();
})

const endGameButton = document.getElementById("end-game");
endGameButton.addEventListener("click", function (event) {
    event.preventDefault();
    var data = GameState.endGame();
    loadGameDataIntoDocument(data);
})

const launchMultipleSimulationsButton = document.getElementById("start-multi-stage-simulation");
launchMultipleSimulationsButton.addEventListener("click", function (event) {
    event.preventDefault();
    const { calibrationParameters, stableParameters, unstableParameters, saddleParameters } = DEFAULT_PARAMETERS;

    GameState.setupGame(calibrationParameters, 'sim', space);
    loadParametersIntoForm(calibrationParameters);
    GameState.startNewGameLoop();
    setTimeout(function () { 
        GameState.updateParameters(stableParameters);
        loadParametersIntoForm(stableParameters);
    }, 1000);
    setTimeout(function () { 
        GameState.updateParameters(unstableParameters);
        loadParametersIntoForm(unstableParameters);
    }, 2000);
    setTimeout(function () { 
        GameState.updateParameters(saddleParameters);
        loadParametersIntoForm(saddleParameters);
    }, 3000);
    setTimeout(function () {;
        loadGameDataIntoDocument(GameState.endGame());
    }, 4000);
})



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

function loadGameDataIntoDocument(dataPoints) {
    var totalGameData = dataPoints;
    var totalDataExport = "";
    var newDiv = document.createElement('div');
    
    for(let gameData of totalGameData) {
        var rows = JSON.stringify(gameData.parameters) + "\n";
        appendStringAsPTag(rows, newDiv);
        let csvContent = "data:text/csv;charset=utf-8,";
        appendStringAsPTag(csvContent, newDiv);
        for(var dataPoint of gameData.dataPoints) {
            var formattedDataPoint = dataPoint.map((action) => { return action.toFixed(3); });
            var csvConvertedDataPoint = String(formattedDataPoint).substring(1, String(formattedDataPoint).length - 1);
            appendStringAsPTag(csvConvertedDataPoint, newDiv);
        }
    }

    var currentDiv = document.getElementById("div1");
    document.body.insertBefore(newDiv, currentDiv);

    function appendStringAsPTag(str, parentDiv) {
        var node = document.createElement("p");
        var textNode = document.createTextNode(str);
        node.appendChild(textNode);
        parentDiv.appendChild(node);
    }
}

//Loads parameters from sessionStorage into variables, and updates fields of parameter forms to those values.
//If sessionStorage doesn't contain any data about parameters, the default params are loaded and used instead.
function loadParametersIntoForm(parameters) {
    var { gameplayParameters, visualParameters } = parameters;

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
