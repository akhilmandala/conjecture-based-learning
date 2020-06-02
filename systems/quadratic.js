import { poly_barrier } from './helpers.js'
// Quadratic game

//TODO: make this more responsive
var ScalarQuadraticParameterList = ['a', 'b', 'c1', 'c2', 'd', 'e'];

class ScalarQuadraticGame {
    constructor(gameplayParameters) {
        this.gameplayParameters = gameplayParameters;
        this.player1 = new Player1(gameplayParameters);
        this.player2 = new Player2(gameplayParameters);
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