(function () {
    var $ = function (id) {
        return document.getElementById(id);
    };
    var reclass = function (id, condition, className) {
        var el = $(id);
        if (condition) el.classList.add(className);
        else el.classList.remove(className);
    };
    var setupLocator = function () {
        reclass('search', false, 'nodisplay');
        var rows = [].slice.call(document.querySelectorAll('table#hospitals tbody tr'));
        var el = $('search');
        function locate() {
            try {
                var term = el.value.toLowerCase();
                rows.forEach(function (row) {
                    var text = row.textContent.toLowerCase();
                    if (text.indexOf(term) >= 0) row.classList.remove('nodisplay');
                    else row.classList.add('nodisplay');
                });
                reclass('hospitals', term.length === 0, 'stripey');
            } catch (e) {}
        }

        var timer;
        function debounce() {
            if (timer) clearTimeout(timer);
            timer = setTimeout(locate, 200);
        }

        if (el) el.addEventListener('input', debounce);
    };

    document.addEventListener('DOMContentLoaded', function (event) {
        try {
            setupLocator();
        } catch (e) {}
    });
})();
