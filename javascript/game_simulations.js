import {Game} from '../systems/ConjectureMultiAgentGames/ConjectureMultiAgentGame.js';
import {QuadraticMachineX, QuadraticMachineY} from '../systems/ConjectureMultiAgentGames/QuadraticGame/QuadraticPlayers.js'
import DEFAULT_PARAMETERS from '../systems/ConjectureMultiAgentGames/QuadraticGame/default-parameters.js';
Pts.namespace(window);

var GameState = Object.create(Game);
var space = initCanvas();

window.addEventListener('load', function(event) {
    GameState.setupSpace(space);
})

window.addEventListener('keyup', keyboardGameControls);

//Helper functions
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
            GameState.init({
                playerOne: QuadraticMachineX, 
                playerTwo: QuadraticMachineY
            });
            GameState.startGameLoop({
                parameters: DEFAULT_PARAMETERS.calibrationParametersA,
                mode: 'p1-vs-sim'
            });
        } else if (e.keyCode === 69) {
            event.preventDefault();
            var data = GameState.endGame();
            loadGameDataIntoDocument(data);
        } else if (e.keyCode === 77) {
            event.preventDefault();
            launchCalibrationTest();
        }
    }
}

function launchCalibrationTest() {
    GameState.init({
        playerOne: QuadraticMachineX,
        playerTwo: QuadraticMachineY,
    });
    GameState.launchExperiment({
        numberOfTrials: 10,
        trialDuration: 2000, //ms
        mode: 'p1-vs-sim',
        parameterSets: [DEFAULT_PARAMETERS.calibrationParametersA, DEFAULT_PARAMETERS.calibrationParametersB]
    });
}

//Creates a Pts space and canvas.
function initCanvas() {
    var space = new CanvasSpace("#pt").setup({
        bgcolor: "#345", resize: true, retina: true
    });
    return space;
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