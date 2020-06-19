var calibrationParametersA = {
    gameplayParameters: {
        a: 1,
        b: 0,
        c1: 0,
        c2: 0,
        d: 2,
        e: 0,
        p1LearningRate: 3.0,
        p2LearningRate: 3.0,
        x0: 2,
        y0:  0.01,
        barrier: 100,
        xLimit: 3.8/1.1,
        yLimit: 2.1/1.1,
        isSimulating: false,
    },
    visualParameters: {
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
}

var calibrationParametersB = {
    gameplayParameters: {
        a: 1,
        b: 0,
        c1: 0,
        c2: 0,
        d: -2,
        e: 0,
        p1LearningRate: 3.0,
        p2LearningRate: 3.0,
        x0: 2,
        y0:  0.01,
        barrier: 100,
        xLimit: 3.8/1.1,
        yLimit: 2.1/1.1,
        isSimulating: false,
    },
    visualParameters: {
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
}

var stableParameters = {
    gameplayParameters: {
        a: 1,
        b: .2,
        c1: -1,
        c2: 1,
        d: 1,
        e: 0,
        p1LearningRate: 3.0,
        p2LearningRate: 3.0,
        x0: 2,
        y0:  0.01,
        barrier: 100,
        xLimit: 3.8/1.1,
        yLimit: 2.1/1.1,
        isSimulating: true,
    },
    visualParameters: {
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
}

var unstableParameters = {
    gameplayParameters: {
        a: -1,
        b: -0.2,
        c1: -1,
        c2: 1,
        d: 0,
        e: 0,
        p1LearningRate: 3.0,
        p2LearningRate: 3.0,
        x0: 2,
        y0:  0.01,
        barrier: 100,
        xLimit: 3.8/1.1,
        yLimit: 2.1/1.1,
        isSimulating: true,
    },
    visualParameters: {
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
}

var saddleParameters = {
    gameplayParameters: {
        a: 1,
        b: -1,
        c1: -0.1,
        c2: 0.1,
        d: 0,
        e: 0,
        p1LearningRate: 3.0,
        p2LearningRate: 3.0,
        x0: 2,
        y0:  0.01,
        barrier: 100,
        xLimit: 3.8/1.1,
        yLimit: 2.1/1.1,
        isSimulating: true,
    },
    visualParameters: {
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
}

const DEFAULT_PARAMETERS = {
    stableParameters,
    unstableParameters,
    saddleParameters,
    calibrationParametersA,
    calibrationParametersB
}

export default DEFAULT_PARAMETERS;