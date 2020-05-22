var parameters = {
    a: 1.1,
    b: 1.2,
    c1: -3,
    c2: 3,
    d: -1.1,
    e: -1.1
}

window.addEventListener("load", function () {
    this.console.log(parameters);
    let form = this.document.getElementById("game-parameters-form");

    sendData = () => {
        form = document.getElementById("game-parameters-form");
        const XHR = new XMLHttpRequest();
        var FD = new FormData(form);
        for(var key of FD.keys()) {
            console.log(key + ": " + FD.get(key));
            parameters[key] = FD.get(key);
        }
        XHR.open('GET', '/');
        XHR.send(FD);
        //Buggy function call
        //redraw();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendData();
    })
})

var locs = [];


const LOWER_FUNCTION_BOUND = -1.5;
const UPPER_FUNCTION_BOUND = 1.5;

const SCREEN_RESOLUTION = 600;

const scaleUp = (num, in_min = UPPER_FUNCTION_BOUND, in_max = LOWER_FUNCTION_BOUND, out_min = 0, out_max = SCREEN_RESOLUTION) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const scaleDown = (num, in_min = 0, in_max = SCREEN_RESOLUTION, out_min = UPPER_FUNCTION_BOUND, out_max = LOWER_FUNCTION_BOUND) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function setup() {
    var canvas = createCanvas(600, 600);
    canvas.parent("game-dynamics-visualization")

    var res = 20;
    var countX = ceil(width / res) + 1;
    var countY = ceil(height / res) + 1;

    for (var j = 0; j < countY; j++) {
        for (var i = 0; i < countX; i++) {
            locs.push(new p5.Vector(res * i, res * j));
        }
    };

    noFill();
    stroke(249, 78, 128);
}

//P5js functions
function draw() {
    background(30, 67, 137);
    offset = 2;
    for (var i = locs.length - 1; i >= 0; i--) {
        var x2 = calcVec(locs[i].x, locs[i].y);
        var x1 = locs[i];
        line(
            x1.x,
            x1.y,
            x1.x + (10 * cos(x2.heading())),
            x1.y + (10 * sin(x2.heading())),
        );
        push() //start new drawing state
        var angle = x2.heading(); //gets the angle of the line
        translate(x1.x + (10 * cos(x2.heading())), x1.y + (10 * sin(x2.heading()))); //translates to the destination vertex
        rotate(angle + HALF_PI); //rotates the arrow point
        triangle(-offset*0.5, offset, offset*0.5, offset, 0, -offset/2); //draws the arrow point as a triangle
        pop();
    };
}

function calcVec(x, y) {
    let {a, b, c1, c2, d, e} = parameters;

    var x1 = scaleDown(x);
    var y1 = scaleDown(y);
    return new p5.Vector(scaleUp(a * x1 + c1 * y1 + d), scaleUp(e + c2 * x1 + b * y1));
}