import {Player} from '../GameObject.js';

var QuarticMachineX = Object.create(Player);

//TODO: convert epsilon to a, d

QuarticMachineX.createPlayer = function(parameters, initialAction) {
    this.init(parameters);
    this.parameters.a = 
    this.action = initialAction;
}

QuarticMachineX.cost = function(x, y) {
    const {a, b, e} = this.parameters;
    return (e / 4) * x * x * x * x + ((a / 2) * x * x) + (b * x * y);
}

QuarticMachineX.update = function(x, y) {
    const {a, b, e} = this.parameters;
    return a * x + e * x * x * x + b * y;    
}

QuarticMachineX.bestResponse = function(x) {
    const {a, b, e} = this.parameters;
    // because the update is cubic, it is easier to compute the 
    // inverse best response instead of solving for the roots.
    return (-a * x - e * x * x * x) / b;
}

var QuarticMachineY = Object.create(Player);

QuarticMachineY.createPlayer = function(parameters, initialAction) {
    this.init(parameters);
    this.action = initialAction;
}

QuarticMachineY.cost = function(x, y) {
    const {d, c} = this.parameters;
    return ((d / 2) * y * y) + (c * x * y);
}

QuarticMachineY.update = function(x, y) {
    const {d, c} = this.parameters;
    return c * x + d * y;
}

QuarticMachineY.bestResponse = function(x) {
    const {d, c} = this.parameters;
    return (c * x) / d;
}

export {QuarticMachineX, QuarticMachineY};
