// Quartic game
// Section 5.A example: https://github.com/bchasnov/research/blob/master/papers/2020-ccabr-stability-of-nash.pdf

var ScalarQuarticParameterList = ['e1', 'e2', 'b', 'c']

class ScalarQuarticGame {
    constructor(parameters) {
        this.parameters = parameters;
        this.player1 = new Player1(parameters);
        this.player2 = new Player2(parameters);
    }

    advanceP1(x, y) {
        return this.player1.update1(x, y);
    }

    advanceP2(x, y) {
        return this.player2.update2(x, y);
    }

    //TODO:
    conjectureP1(x, y) {
        return 0;
    }

    conjectureP2(x, y) {
        return 0;
    }
}


class Player1 {
    constructor(player_parameters) {
        this.parameters = player_parameters;
    }

    cost1(x, y) {
        const {a, b, e} = this.parameters;
        return (e / 4) * x * x * x * x + ((a / 2) * x * x) + (b * x * y);
    }

    update1(x, y) {
        const {a, b, e} = this.parameters;
        return a * x + e * x * x * x + b * y;
    }

    bestresponse1inv(x) {
        const {a, b, e} = this.parameters;
        // because the update is cubic, it is easier to compute the 
        // inverse best response instead of solving for the roots.
        return (-a * x - e * x * x * x) / b;
    }
}

class Player2 {
    constructor(player_parameters) {
        this.parameters = player_parameters;
    }

    cost2(x, y) {
        const {d, c} = this.parameters;
        return ((d / 2) * y * y) + (c * x * y);
    }

    update2(x, y) {
        const {d, c} = this.parameters;
        return c * x + d * y;
    }

    bestresponse2(x) {
        const {d, c} = this.parameters;
        return (c * x) / d;
    }
}

export { ScalarQuarticParameterList, ScalarQuarticGame };