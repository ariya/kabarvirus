(function () {
    try {
        var M = Math;
        var numbers = {};
        var props = ['infected', 'recovered', 'fatal'];
        props.forEach(function (prop) {
            numbers[prop] = document.getElementById(prop).innerText;
        });
        var steps = 29;
        function tick() {
            props.forEach(function (i) {
                var display = '';
                while (display.length < numbers[i].length) display += M.floor(10 * M.random());
                document.getElementById(i).innerText = display;
            });
            if (steps > 0) setTimeout(tick, 15);
            else {
                props.forEach(function (i) {
                    document.getElementById(i).innerText = numbers[i];
                });
            }
            --steps;
        }
        tick();
    } catch (e) {}
})();
