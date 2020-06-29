var quarticGameParameters = {
    gameplayParameters: {
        a: -1.1,
        b: -1.0,
        c: 2,
        d: 1.2,
        e: 1,
        p1LearningRate: 3.0,
        p2LearningRate: 3.0,
        x0: 3,
        y0:  -3,
        barrier: 100,
        xLimit: 3.8/1.1,
        yLimit: 2.1/1.1,
        isSimulating: true,
    }, visualParameters: {
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
    quarticGameParameters
}

export default DEFAULT_PARAMETERS;