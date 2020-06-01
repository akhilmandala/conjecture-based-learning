for (var i = 1; i <= 5; i++) {
    (function timed() {
        var j = i;
        setTimeout(function timer() {
            console.log(j);
        }, i * 1000);
    })();
}
