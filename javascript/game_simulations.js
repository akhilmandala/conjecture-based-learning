//Game dynamics variables
// UNSTABLE:
var DEFAULT_PARAMETERS = {
    a: 1,
    b: .2,
    c1: -1,
    c2: 1,
    d: 1,
    e: 0
}
// //STABLE:
// var DEFAULT_PARAMETERS = {
//     a: 1,
//     b: 2,
//     c1: -1,
//     c2: 1,
//     d: 1,
//     e: 1
// }

const form = document.getElementById("parameter-form");

const DEFAULT_SIMULATION_SETTING = true;
const DEFAULT_DISPLAY_VECTOR_FIELD_VIEW_SETTING = true;
const DEFAULT_DISPLAY_PLAYER_ACTION_LINES_SETTING = true;
const DEFAULT_DISPLAY_PLAYER_PATH_SETTING = true;

const COLOR_P1 = "#33f";
const COLOR_P2 = "#f33";

var synth = new Tone.Synth().toMaster();

let toggle_simulation = DEFAULT_SIMULATION_SETTING;
let display_vector_field = DEFAULT_DISPLAY_VECTOR_FIELD_VIEW_SETTING;
let display_player_action_lines = DEFAULT_DISPLAY_PLAYER_ACTION_LINES_SETTING;
let display_player_path = DEFAULT_DISPLAY_PLAYER_PATH_SETTING;

//Event listeners
window.addEventListener('load', function (event) {
    this.console.log("Loaded DOM");

    //Set parameter values
    if(this.sessionStorage.getItem("parameters") === null) {
        console.log("Initializing parameters");
        //First time page is being loaded, set the parameters to default
        this.sessionStorage.setItem("parameters", JSON.stringify(DEFAULT_PARAMETERS));
    }

    var parameters = JSON.parse(sessionStorage.getItem("parameters"));

    for(let [parameter, value] of Object.entries(JSON.parse(this.sessionStorage.getItem("parameters")))) {
        this.document.getElementsByName(parameter)[0].value = value;
    }

    //Initiate game loop
    this.game_loop(parameters);
})

form.addEventListener('submit', function(event) {
    loadGameConfiguration();
})

document.addEventListener('keyup', function (event) {
    if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        toggle_simulation = !toggle_simulation;
        console.log(toggle_simulation)
    }
})

//Helper functions
function loadGameConfiguration() {
    this.console.log("updating..")
    let FD = new FormData(form);
    let parameters = JSON.parse(this.sessionStorage.getItem("parameters"));

    for(var key of FD.keys()) {
        console.log(key + ": " + FD.get(key));
        parameters[key] = parseFloat(FD.get(key));
        console.log(typeof FD.get(key));
        this.document.getElementsByName(key)[0].value = FD.get(key);
    }

    console.log(parameters);

    this.sessionStorage.setItem("parameters", JSON.stringify(parameters));
}

function reset_game_conditions(event) {
    event.preventDefault();
    a = Number(document.getElementById('game-config-value-a').value);
    d = Number(document.getElementById('game-config-value-d').value);
    synth.triggerRelease();
    console.log(a);
    console.log(d);
}

function game_loop(parameters = DEFAULT_PARAMETERS) {
    console.log("INITIALIZING GAME STATE...");
    Pts.namespace(window);
    synth.triggerAttack("C4");
    var osc = new Tone.Oscillator({
        "frequency": 261.626,
        "type": "sawtooth10",
        "volume": -60
    }).toMaster();
    osc.start();

    // Initiate Space and Form
    var space = new CanvasSpace("#pt").setup({ bgcolor: "#345", resize: true, retina: true });
    var form = space.getForm();
    console.log("NEW")
    console.log(typeof space)

    var radius = 1;
    var time_scale = 1 / 1000;
    var visual_scale = 100;
    var output_scale = 100;
    var y0 = 0;
    var x0 = 0;
    var vectorfield_scale = 10;

    //Gameplay variables
    var barrier = 100.;
    var lr1 = 3.;
    var lr2 = 3.;
    var xlim = 3.8/1.1;
    var ylim = 2.1/1.1;
    var eps = 0.001;
    var x = 2;
    var y = .01;

    var points = new Group(new Pt(x0, y0), new Pt(x0, y0));

    var parameters = JSON.parse(sessionStorage.getItem("parameters"));
    const { a, b, c1, c2, d, e } = parameters;

    function cost1(x, y) {
        return ((a / 2) * x * x) + (c1 * x * y) + d * x;
    }

    function cost2(x, y) {
        return ((b / 2) * y * y) + (c2 * x * y) + e * y;
    }

    function total_cost(x, y) {
        return cost1(x, y) + cost2(x, y);
    }

    function log_barrier(x, min, max) {
        //return 0;
        return 1 / (x - min) - 1 / (max - x);
    }

    function poly_barrier(x, min, max, n=8) { 
        // n must be even
        if (x < min) return -Math.pow(min-x, n-1)/n;
        if (x > max) return Math.pow(x-max, n-1)/n;
        return 0;
    }

    function sat(x, lim) {
        if(x >= lim) {
            return x-eps;
        } else if (x <= -lim) {
            return -x+eps;
        }
        return x;
    }

    update1 = (x, y) => {
        return a * x + c1 * y + d + barrier * poly_barrier(x, -xlim, xlim);
    }
    update2 = (x, y) => {
        return b * y + c2 * x + e + barrier * poly_barrier(y, -ylim, ylim);
    }


    fixedpoint = () => {
        // Solves equations update1(x,y)=update2(x,y)=0 for x,y 
        return new Pt(-(b*d-c1*e)/(a*b-c1*c2), -(c2*d-a*e)/(-a*b+c1*c2));
    }

    bestresponse1 = (y) => { return (-d - c1 * y) / a; }
    bestresponse2 = (x) => { return (-e - c2 * x) / b; }

    // Transformation functions
    function toOrigin(x, y) {
        return new Pt((x - x0) / visual_scale, -(y - y0) / visual_scale);
    }

    function fromOrigin(x, y) {
        return new Pt(x * visual_scale + x0, -y * visual_scale + y0);
    }

    function get_x() {
        return (space.pointer.x - x0) / visual_scale;
    }

    function get_y() {
        return (space.pointer.y - y0) / visual_scale;
    }

    var history = new Group();

    console.log(x);

    const pts_gameplay = {
        start: (bound) => {
            y0 = space.height / 2;
            x0 = space.width / 2;
            xmin = -100; // autodetect this
            xmax = 100;  // 
            ymin = -100;
            ymax = 100;
            br1 = Group.fromArray([fromOrigin(bestresponse1(ymin), ymin),
            fromOrigin(bestresponse1(ymax), ymax)]);
            br2 = Group.fromArray([fromOrigin(xmin, bestresponse2(xmin)),
            fromOrigin(xmax, bestresponse2(xmax))]);
        },

        animate: (time, ftime) => {
            // Step 
            //x = sat(x, lim);
            //y = sat(y, lim);            

            form.strokeOnly(COLOR_P1, 2).line(br1);
            form.strokeOnly(COLOR_P2, 2).line(br2);

            if (toggle_simulation) { // both players simulate
                x = x - ftime * time_scale * lr1 * update1(x, y);
                y = y - ftime * time_scale * lr2 * update2(x, y);
            } else { // player 1 is human
                x = get_x();
                y = y - ftime * time_scale * lr2 * update2(x, y);
            }/*
            else { // player 2 is human
                console.log("retrieving movement");
                x = x - ftime * time_scale * lr1 * update1(x,y);
                y = get_y()
            }*/
            history.push(new Pt(x,y));

            // Output
            var f1 = cost1(x, y);
            osc.frequency.rampTo(261 - output_scale * f1, ftime / 1000);

            let c1 = Circle.fromCenter(fromOrigin(x, y), 5);

            fixed = fixedpoint();

            let origin = Circle.fromCenter(fromOrigin(fixed.x, fixed.y), 10);

            form.fillOnly("#fff").circle(origin);
            form.fill("#000").circle(c1);

            let vectorfield = Create.gridPts( space.innerBound, 20, 20).map(
                (p) => {
                    q = toOrigin(p.x, p.y);
                    dx = update1(q.x, q.y);
                    dy = -update2(q.x, q.y);
                    norm = Math.sqrt(dx*dx + dy*dy);
                    dy /= norm*vectorfield_scale;
                    if(toggle_simulation) {
                        dx /= norm*vectorfield_scale;
                    } else {
                        dx = 0;
                    }

                    return new Group(p, p.$subtract(new Pt(dx*visual_scale, dy*visual_scale)));
                });
            
            let vectorfield_pts = Create.gridPts( space.innerBound, 20, 20);
            form.strokeOnly("#ccc",1).lines(vectorfield);
            form.fillOnly("#ccc").points(vectorfield_pts, 1);
            form.strokeOnly("#888", 1).line(history.map((p)=>fromOrigin(p.x, p.y)));

        }

    }

    space.add(pts_gameplay);

    // bind mouse events and play animation
    space.bindMouse().bindTouch().play();
}