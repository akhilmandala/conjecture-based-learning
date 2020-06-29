import {Game} from './systems/ConjectureMultiAgentGames/ConjectureMultiAgentGame.js';
import {QuadraticMachineX, QuadraticMachineY} from './systems/ConjectureMultiAgentGames/QuadraticGame/QuadraticPlayers.js'
import DEFAULT_PARAMETERS from './systems/ConjectureMultiAgentGames/QuadraticGame/default-parameters.js';
import './css/index.css';

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

window.addEventListener('load', function(event) {
    GameState.setupSpace({
        visualParameters: DEFAULT_VISUAL_PARAMETERS
    });
})

window.addEventListener('keyup', keyboardGameControls);

function keyboardGameControls(e) {
    if(e.ctrlKey) {
        if(e.keyCode === 83) {
            //start game
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
            //end game
            event.preventDefault();
            var data = GameState.endGame();
            loadGameDataIntoCSV(data);
        } else if (e.keyCode === 77) {
            //launch experiment
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