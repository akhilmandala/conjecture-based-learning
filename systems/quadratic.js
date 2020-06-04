import { poly_barrier } from './helpers.js'
// Quadratic game
//TODO: make this more responsive
var ScalarQuadraticParameterList = ['a', 'b', 'c1', 'c2', 'd', 'e'];

class ScalarQuadraticGame {
    constructor(gameplayParameters, visualParameters) {
        this.gameplayParameters = gameplayParameters;
        this.visualParameters = visualParameters;
        this.player1 = new Player1(gameplayParameters);
        this.player2 = new Player2(gameplayParameters);
        this.dataPoints = [];
    }

    fixedPoint() {
        const { a, b, c1, c2, d, e } = this.gameplayParameters;
        return [-(b * d - c1 * e) / (a * b - c1 * c2),
            -(c2 * d - a * e) / (-a * b + c1 * c2)];
    }

    advanceP1(x, y) {
        return this.player1.update1(x, y);
    }

    advanceP2(x, y) {
        return this.player2.update2(x, y);
    }

    conjectureP1(x, y) {
        return this.player1.update1(x, y);
        // + lrconj1 * Dx_conj1(x,y) * Dy_cost1(x,y)
    }

    conjectureP2(x, y) {
        return this.player1.update1(x, y);
        // + lrconj2 * Dy_conj2(x,y) * Dx_cost2(x,y)
    }

    returnGameData() {
        console.log("points");
        return this.dataPoints;
    }

    game_loop(space) {
        //Since each player is an object that we add to the space, it's possible we can make each player their own object
        //could lead to some more interesting dynamics?

        // TODO: Link constant parameters to HTML doc
        const HEIGHT = document.getElementById("gameplay-window-total").offsetHeight;
        const WIDTH = document.getElementById("gameplay-window-total").offsetWidth;
        const ORIGIN_RADIUS = 10;
        const PLAYER_ACTION_RADIUS = 5;
        const COLOR_P1 = "#e63946";
        const COLOR_P2 = "#ffba08";
        var isSimulating = true;

        var { x0, y0, barrier } = this.gameplayParameters;
        var { timeScale, visualScale, vectorFieldScale } = this.visualParameters;

        // Centers of canvas, updated at init
        var yCenter = HEIGHT / 2;
        var xCenter = WIDTH / 2;
        // Starting conditions
        var x = x0;
        var y = y0;
        // Object to trace taken path
        var history = new Group();
        // Overall game project

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
        var form = space.getForm();

        var vectorfield, vectorfield_pts;

        var timestamp;

        br1 = Group.fromArray([toScreen(this.player1.bestresponse1(ymin), ymin),
        toScreen(this.player1.bestresponse1(ymax), ymax)]);
        br2 = Group.fromArray([toScreen(xmin, this.player2.bestresponse2(xmin)),
        toScreen(xmax, this.player2.bestresponse2(xmax))]);

        fixed = new Pt(this.fixedPoint());

        origin = Circle.fromCenter(toScreen(fixed.x, fixed.y), ORIGIN_RADIUS);

        currentAction = Circle.fromCenter(toScreen(x, y), PLAYER_ACTION_RADIUS);

        const GameExecutionController = {
            start: (bound) => {
                y = y0;
                x = x0;

                vectorfield = Create.gridPts(bound, 30, 30).map(
                    (p) => {
                        let q, dx, dy, norm;
                        q = fromScreen(p.x, p.y);
                        dx = this.advanceP1(q.x, q.y);
                        dy = this.advanceP2(q.x, q.y);
                        norm = Math.sqrt(dx * dx + dy * dy);
                        dy /= norm * vectorFieldScale;
                        if (isSimulating) {
                            dx /= norm * vectorFieldScale;
                        } else {
                            dx = 0;
                        }

                        return new Group(p, p.$add(new Pt(dx * visualScale, -dy * visualScale)));
                    });

                vectorfield_pts = Create.gridPts(bound, 30, 30);

                timestamp = performance.now();
            },

            animate: (time, ftime) => {
                // Adaptive time scale (TODO: measure the distribution of ftime)
                var dt = ftime * timeScale;
                var input = getMouse(space.pointer);

                if (isSimulating) { // both players simulate
                    x = x - dt * this.advanceP1(x, y);
                    y = y - dt * this.advanceP2(x, y);
                } else if (!isSimulating) { // player 1 is human
                    x = input.x;
                    y = y - dt * this.advanceP2(x, y);
                } else { // TODO: replace toggle_simulation with simulation_mode and add the following case
                    x = x - dt * this.advanceP1(x, y);
                    y = input.y;
                }

                //log data point
                this.dataPoints.push({
                    x,
                    y,
                    timestamp: timestamp
                });
                timestamp = performance.now();

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
}



class Player1 {
    constructor(player_parameters) {
        this.parameters = player_parameters;
    }

    cost1(x, y) {
        const {a, c1, d} = this.parameters;
        return ((a / 2) * x * x) + (c1 * x * y) + d * x;
    }

    update1(x, y) {
        const { a, c1, d, p1LearningRate, barrier, xLimit } = this.parameters;
        return p1LearningRate * (a * x + c1 * y + d + barrier * poly_barrier(x, -xLimit, xLimit));
    }

    bestresponse1(y) {
        const {a, c1, d} = this.parameters;
        return (-d - c1 * y) / a;
    }
}

class Player2 {
    constructor(player_parameters) {
        this.parameters = player_parameters;
    }

    cost2(x, y) {
        const {b, c2, e} = this.parameters;
        return ((b / 2) * y * y) + (c2 * x * y) + e * y;
    }

    update2(x, y) {
        const { b, c2, e, p2LearningRate, barrier, yLimit } = this.parameters;
        return p2LearningRate * (b * y + c2 * x + e + barrier * poly_barrier(y, -yLimit, yLimit));
    }

    bestresponse2(x) {
        const {b, c2, e} = this.parameters;
        return (-e - c2 * x) / b;
    }
}

export { ScalarQuadraticParameterList, ScalarQuadraticGame };