import {Game} from './systems/ConjectureMultiAgentGames/ConjectureMultiAgentGame.js';
import {QuadraticMachineX, QuadraticMachineY} from './systems/ConjectureMultiAgentGames/QuadraticGame/QuadraticPlayers.js'
import DEFAULT_PARAMETERS from './systems/ConjectureMultiAgentGames/QuadraticGame/default-parameters.js';

Pts.namespace(window);

var DEFAULT_VISUAL_PARAMETERS = {
    radius: 1,
    timeScale: 1/1000,
    visualScale: 100,
    outputScale: 100,
    vectorFieldScale: 10,
    COLOR_P1: "#e63946",
    COLOR_P2: "#ffba08",
    PLAYER_ACTION_RADIUS: 5,
    ORIGIN_RADIUS: 10,
}

var GameState = Object.create(Game);
var space = initCanvas();

window.addEventListener('load', function(event) {
    GameState.setupSpace({
        space, 
        visualParameters: DEFAULT_VISUAL_PARAMETERS
    });
})

window.addEventListener('keyup', keyboardGameControls);

// var vm = new Vue({
//     el: "#app",
//     data: {
//         message: "Hello!"
//     }
// });

//Helper functions
/**
 * Keyboard controls for game: 
 *  - ctrl + 's' => start game
 *  - ctrl + 'e => end game
 *  - ctrl + 'm' => launch calibration test
 */
function keyboardGameControls(e) {
    if(e.ctrlKey) {
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
            loadGameDataIntoCSV(data);
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
        numberOfTrials: 1,
        trialDuration: 20000, //ms
        mode: 'p1-vs-sim',
        parameterSets: [DEFAULT_PARAMETERS.saddleParameters]
    });
}

//Creates a Pts space and canvas.
function initCanvas() {
    var space = new Pts.CanvasSpace("#pt").setup({
        bgcolor: "#345", resize: true, retina: true
    });
    return space;
}

function loadGameDataIntoCSV(dataPoints) {
    var totalGameData = dataPoints;
    
    var csvContent = "data:text/csv;charset=utf-8,";
    for(let gameData of totalGameData) {
        for(let dataPoint of gameData.payload.dataPoints) {
            let formattedDataPoint = dataPoint.map((action) => { return action.toFixed(5); });
            csvContent += formattedDataPoint + "\r\n";
        }
    }

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}