var Game = {
    init: function (parameters) {
        this.parameters = parameters;
        this.dataPoints = [];
    },
    exportData: function () {
        //perform some data transformation
        return this.dataPoints;
    }
}

var Player = {
    init: function init(parameters) {
        this.parameters = parameters;
    },
}

export {Game, Player};