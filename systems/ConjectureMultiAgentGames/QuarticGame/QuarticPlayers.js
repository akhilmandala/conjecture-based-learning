import {Player} from '../ConjectureMultiAgentGame.js';

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


class ScalarQuarticGameOld {
    //TODO:
    conjectureP1(x, y) {
        return this.player1.update1(x, y) - lr * c * b * x;
        // Dxf1(x, xi1(x)) = (df1/dx)(x, xi(x)) 
    }

    // chain rule
    //  f(g(x))' = d/dx f(g(x)) = f'(g(x)) * g'(x) 

    //  cost 
    //    f: X x Y -> R
    //  "conjecture/internal model" 
    //    xi: X -> Y
    //     e.g. xi(x) = argmin_y f2(x,y) 
    //     e.g. xi(x) = y - lr * (df2/dy)(x,y)
    //          dxi/dx = - lr (d/dx)(df2/dy)(x,y) = - lr (d^2/dxdy)f2(x,y)
    //     e.g. xi(\theta, y)  "function approximator with parameter \theta" 
    //          linear polixy: xi(x) = Ax + b... learn A,b from data
    //          neural network policy
    // 
    //  y = xi(x),  
    //  d/dx f(x, xi(x)) = df/dx + df/dxi * dxi/dx
    // 

    // = df/dx * dg/dx
    //
    // [ df/dx, dg/dx, df/dy ]

    conjectureP2(x, y) {
        return 0;
    }
}

export {QuarticMachineX, QuarticMachineY};
