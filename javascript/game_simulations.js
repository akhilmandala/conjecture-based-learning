import {QuadraticGame} from '../systems/ConjectureMultiAgentGames/QuadraticGame/QuadraticGame.js'
import DEFAULT_PARAMETERS from '../systems/ConjectureMultiAgentGames/QuadraticGame/default-parameters.js';
import { Game } from '../systems/ConjectureMultiAgentGames/ConjectureMultiAgentGame.js';
Pts.namespace(window);

var GameState = Object.create(QuadraticGame);
var space = initCanvas();
var parameters = DEFAULT_PARAMETERS.calibrationParametersA;

window.addEventListener('load', function(event) {
    GameState.setupSpace(space);
})

window.addEventListener('keyup', keyboardGameControls);

//Helper functions
//Attaches listeners to buttons and keyboard for toggle events (loading parameters, starting game,
//triggering simulations.)

/**
 * Keyboard controls for game: 
 *  - ctrl + 's' => start game
 *  - ctrl + 'e => end game
 *  - ctrl + 'm' => launch calibration test
 */
function keyboardGameControls(e) {
    if(!!e.ctrlKey) {
        if(e.keyCode === 83) {
            event.preventDefault();
            GameState.setupGame(parameters, 'p1-vs-sim');
            GameState.startGameLoop();
        } else if (e.keyCode === 69) {
            event.preventDefault();
            var data = GameState.endGame();
            loadGameDataIntoDocument(data);
        } else if (e.keyCode === 77) {
            event.preventDefault();
            console.log("game started");
            launchMultipleSimulations();
        }
    }
}

function launchMultipleSimulations() {
        const { calibrationParametersA, calibrationParametersB } = DEFAULT_PARAMETERS;
        GameState.setupGame(calibrationParametersA, 'p1-vs-sim', space);
        GameState.startGameLoop();
        for(let i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                setTimeout(function() {
                    GameState.updateParameters(calibrationParametersB);
                }, i * 2000);
            } else {
                setTimeout(function() {
                    GameState.updateParameters(calibrationParametersA);
                }, i * 2000);
            }
        }
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
        "type": "triangle4",
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
        var rows = JSON.stringify(gameData.payload.parameters) + "\n";
        appendStringAsPTag(rows, newDiv);
        // let csvContent = "data:text/csv;charset=utf-8,";
        // appendStringAsPTag(csvContent, newDiv);
        for(var dataPoint of gameData.payload.dataPoints) {
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