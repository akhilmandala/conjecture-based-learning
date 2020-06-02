const DEFAULT_GAMEPLAY_PARAMETERS = {
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
}

const DEFAULT_VISUAL_PARAMETERS = {
    radius: 1,
    timeScale: 1/1000,
    visualScale: 100,
    outputScale: 100,
    vectorFieldScale: 10,

}

const DEFAULT_SIMULATION_SETTING = true;

export {DEFAULT_GAMEPLAY_PARAMETERS, DEFAULT_VISUAL_PARAMETERS, DEFAULT_SIMULATION_SETTING};