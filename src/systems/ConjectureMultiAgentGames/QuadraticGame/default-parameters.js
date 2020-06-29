var calibrationParametersA = {
    a: 1,
    b: 0,
    c1: 0,
    c2: 0,
    d: 2,
    e: 0,
    p1LearningRate: 3.0,
    p2LearningRate: 3.0,
    x0: 2,
    y0: 0.01,
    barrier: 100,
    xLimit: 3.8 / 1.1,
    yLimit: 2.1 / 1.1,
    isSimulating: false,
}

var calibrationParametersB = {
    a: 1,
    b: 0,
    c1: 0,
    c2: 0,
    d: -2,
    e: 0,
    p1LearningRate: 3.0,
    p2LearningRate: 3.0,
    x0: 2,
    y0: 0.01,
    barrier: 100,
    xLimit: 3.8 / 1.1,
    yLimit: 2.1 / 1.1,
    isSimulating: false,
}

var stableParameters = {
    a: 1,
    b: .2,
    c1: -1,
    c2: 1,
    d: 1,
    e: 0,
    p1LearningRate: 3.0,
    p2LearningRate: 3.0,
    x0: 2,
    y0: 0.01,
    barrier: 100,
    xLimit: 3.8 / 1.1,
    yLimit: 2.1 / 1.1,
    isSimulating: true,
}


var unstableParameters = {
    a: -1,
    b: -0.2,
    c1: -1,
    c2: 1,
    d: 0,
    e: 0,
    p1LearningRate: 3.0,
    p2LearningRate: 3.0,
    x0: 2,
    y0: 0.01,
    barrier: 100,
    xLimit: 3.8 / 1.1,
    yLimit: 2.1 / 1.1,
    isSimulating: true,
}

var saddleParameters = {
    a: 1,
    b: -1,
    c1: -0.1,
    c2: 0.1,
    d: 0,
    e: 0,
    p1LearningRate: 3.0,
    p2LearningRate: 3.0,
    x0: 2,
    y0: 0.01,
    barrier: 100,
    xLimit: 3.8 / 1.1,
    yLimit: 2.1 / 1.1,
    isSimulating: true,
}

const DEFAULT_PARAMETERS = {
    stableParameters,
    unstableParameters,
    saddleParameters,
    calibrationParametersA,
    calibrationParametersB
}

export default DEFAULT_PARAMETERS;