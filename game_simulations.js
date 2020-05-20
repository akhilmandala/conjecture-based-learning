let a = 1.1;
let b = 1.1;
let c = 3;
let d = -1.1;
let e = -1.1;
var synth = new Tone.Synth().toMaster();


function reset_game_conditions(event) {
    event.preventDefault();
    a = Number(document.getElementById('game-config-value-a').value);
    d = Number(document.getElementById('game-config-value-d').value);
    synth.triggerRelease();
    console.log(a);
    console.log(d);

}

function game_loop() {
    console.log("INITIALIZING GAME STATE...");
    Pts.namespace(window);
    synth.triggerAttack("C4");
    var osc = new Tone.Oscillator({
        "frequency": 261.626,
        "type": "sawtooth10",
        "volume": -20
    }).toMaster();
    osc.start();

    // Initiate Space and Form
    var space = new CanvasSpace("#pt").setup({ bgcolor: "#345", resize: true, retina: true });
    var form = space.getForm();
    console.log("NEW")
    console.log(typeof space)

    var radius = 10;
    var time_scale = 1 / 1000;
    var visual_scale = 100;
    var output_scale = 100;
    var machine_learning_rate = .1;
    var simulation_learning_rate = 1;

    var y0 = 0;
    var x0 = 0;

    var x = .01;
    var y = .01;
    var points = new Group(new Pt(x0, y0), new Pt(x0, y0));

    function total_cost(x, y) { 
        return (a * x * x) + (b * y * y) + (c * x * y) + (d * x) + (e * y) 
    }

    function objective1(x, y) {
        return d * y * y / 2 - x * y
    }

    function objective2(x, y) {
        return a * x * x / 2 + y * x / 2 - x * x * x * x / 4
    }

    function update1(x, y) {
        return x + machine_learning_rate * (2 * a * x + c * y + d);
    }

    function update2(x, y) {
        return y + machine_learning_rate * (2 * b * y + c * x + e);
    }

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



    space.add({

        start: (bound) => {
            y0 = space.height / 2;
            x0 = space.width / 2;
        },

        animate: (time, ftime) => {
            x = get_x();
            x = x + ftime*time_scale*update1(x,y);
            y = y + ftime * time_scale * update2(x, y);
            var f1 = total_cost(x, y);
            osc.frequency.rampTo(261 - output_scale * f1, ftime / 1000);

            let c1 = Circle.fromCenter(fromOrigin(x, y), 5);

            let origin = Circle.fromCenter(new Pt(x0, y0), 10);

            form.fillOnly("#fff").circle(origin);
            form.fill("#000").circle(c1);

        }

    });

    // bind mouse events and play animation
    space.bindMouse().bindTouch().play();
}

window.game_loop();