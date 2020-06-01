import { ScalarQuadraticGame } from '../systems/quadratic.js';
import { poly_barrier } from '../systems/helpers.js';
import {DEFAULT_GAMEPLAY_PARAMETERS, DEFAULT_VISUAL_PARAMETERS, DEFAULT_SIMULATION_SETTING} from '../systems/default-parameters.js';
Pts.namespace(window);

window.addEventListener('load', function initializeGameLoop(event) {
    var parameters = loadGameParameters();
    var space = initCanvas();
    var synth = new Tone.Synth().toMaster();
    var osc = initOscillator();
    var isSimulating = DEFAULT_SIMULATION_SETTING;

    attachListeners();
    game_loop(parameters);

    //Helper functions
    function attachListeners() {
        (function attachFormListener() {
            const form = document.getElementById("parameter-form");
            form.addEventListener('submit', function (event) {
                resetGameParameters();
            });
        })();

        (function attachToggleSimulationListener() {
            document.addEventListener('keyup', function (event) {
                if (event.ctrlKey && event.key === 't') {
                    event.preventDefault();
                    isSimulating = !isSimulating;
                    console.log(isSimulating)
                }
            });
        })();

        //Set parameter values
        if (sessionStorage.getItem("parameters") === null) {
            console.log("Initializing parameters");
            //First time page is being loaded, set the parameters to default
            sessionStorage.setItem("parameters", JSON.stringify(DEFAULT_GAMEPLAY_PARAMETERS));
        }

        for (let [parameter, value] of Object.entries(JSON.parse(sessionStorage.getItem("parameters")))) {
            document.getElementsByName(parameter)[0].value = value;
        }
    }

    function loadGameParameters() {
        if (sessionStorage.getItem("parameters") === null) {
            sessionStorage.setItem("parameters", JSON.stringify(DEFAULT_GAMEPLAY_PARAMETERS));
        }
        var parameters = JSON.parse(sessionStorage.getItem("parameters"));
        for (let [parameter, value] of Object.entries(parameters)) {
            document.getElementsByName(parameter)[0].value = value;
        }
        return parameters;
    }

    function initCanvas() {
        var space = new CanvasSpace("#pt").setup({
            bgcolor: "#345", resize: true, retina: true
        });
        return space;
    }

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

    function game_loop(gameplayParameters = DEFAULT_GAMEPLAY_PARAMETERS, visualParameters = DEFAULT_VISUAL_PARAMETERS) {
        var {p1LearningRate, p2LearningRate, x0, y0, barrier, xLimit, yLimit} = gameplayParameters;
        var {radius, timeScale, visualScale, outputScale, vectorFieldScale} = visualParameters;
        
        //Initialize form
        var form = space.getForm();
    
        // Centers of canvas, updated at init
        var yCenter = NaN;
        var xCenter = NaN;
    
        var GameState = new ScalarQuadraticGame(gameplayParameters);
    
        // Starting conditions
        var x = x0;
        var y = y0;
    
        // Transformation functions
        function fromScreen(x, y) {
            return new Pt((x - xCenter) / visualScale, -(y - yCenter) / visualScale);
        }
    
        function toScreen(x, y) {
            return new Pt(x * visualScale + xCenter, -y * visualScale + yCenter);
        }
    
        // Get mouse position 
        function get_mouse(pointer) {
            return fromScreen(pointer.x, pointer.y);
        }
    
        function get_x() {
            return get_mouse(space.pointer).x
        }
    
        var history = new Group();;
    
        var br1, br2;
    
        const pts_gameplay = {
            start: (bound) => {
                yCenter = space.height / 2;
                xCenter = space.width / 2;
                // TODO: compute best response curve
                // xmin = -100; // autodetect this
                // xmax = 100;  // 
                // ymin = -100;
                // ymax = 100;
                // br1 = Group.fromArray([toScreen(GameState.player1.bestresponse1(ymin), ymin),
                //     toScreen(GameState.player1.bestresponse1(ymax), ymax)]);
                // br2 = Group.fromArray([toScreen(xmin, GameState.player2.bestresponse2(xmin)),
                //     toScreen(xmax, GameState.player2.bestresponse2(xmax))]);
            },
    
            animate: (time, ftime) => {
                // Adaptive time scale (TODO: measure the distribution of ftime)
                var dt = ftime * timeScale;
    
                // TODO: Draw best response lines
                // form.strokeOnly(COLOR_P1, 2).line(br1);
                // form.strokeOnly(COLOR_P2, 2).line(br2);
    
                var input = get_mouse(space.pointer);
    
                if (isSimulating) { // both players simulate
                    x = x - dt * p1LearningRate * (
                        GameState.advanceP1(x, y) + barrier * poly_barrier(x, -xLimit, xLimit));
                    y = y - dt * p2LearningRate * (
                        GameState.advanceP2(x, y) + barrier * poly_barrier(y, -yLimit, yLimit));
                } else if (!isSimulating) { // player 1 is human
                    x = input.x;
                    y = y - dt * p2LearningRate * (
                        GameState.advanceP2(x, y) + barrier * poly_barrier(y, -yLimit, yLimit));
                } else { // TODO: replace toggle_simulation with simulation_mode and add the following case
                    x = x - dt * p1LearningRate * (
                        GameState.advanceP1(x, y) + barrier * poly_barrier(x, -xLimit, xLimit));
                    y = input.y;
                }
                history.push(new Pt(x, y));
    
                // Output
                var f1 = GameState.player1.cost1(x, y);
                osc.frequency.rampTo(261 - outputScale * f1, ftime / 1000);
    
                let c1 = Circle.fromCenter(toScreen(x, y), 5);
    
                let fixed = new Pt(GameState.fixedPoint());
    
                let origin = Circle.fromCenter(toScreen(fixed.x, fixed.y), 10);
    
                form.fillOnly("#fff").circle(origin);
                form.fill("#000").circle(c1);
    
                let vectorfield = Create.gridPts(space.innerBound, 20, 20).map(
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
    
                        return new Group(p, p.$subtract(new Pt(dx * visualScale, -dy * visualScale)));
                    });
    
                let vectorfield_pts = Create.gridPts(space.innerBound, 20, 20);
                form.strokeOnly("#ccc", 1).lines(vectorfield);
                form.fillOnly("#ccc").points(vectorfield_pts, 1);
                form.strokeOnly("#888", 1).line(history.map((p) => toScreen(p.x, p.y)));
    
            }
    
        }
    
        space.add(pts_gameplay);
    
        // bind mouse events and play animation
        space.bindMouse().bindTouch().play();
    }
})