(function () {
    var selectiveStore = JSON.parse(window.localStorage.getItem('selective'));

    var $ = function (id) {
        return document.getElementById(id);
    };
    var reclass = function (id, condition, className) {
        var el = $(id);
        if (condition) el.classList.add(className);
        else el.classList.remove(className);
    };
    var selective = false;
    if (selectiveStore && typeof selectiveStore === 'boolean') {
        selective = selectiveStore;
    }
    var setupSelective = function () {
        var btn = $('selective');
        reclass('selective', false, 'nodisplay');
        function setBtnState() {
            reclass('provinces', selective, 'selective');
            reclass('selective', !selective, 'outline');
            btn.innerHTML = selective ? '&#x25BC; Tampilkan Semua Provinsi' : '&#x25B2; Hanya 7 Besar';
            btn.blur();
        }
        function toggleSelective() {
            selective = !selective;
            window.localStorage.setItem('selective', selective);
            setBtnState();
        }
        btn.addEventListener('click', toggleSelective);
        setBtnState();
    };
    var setupFilter = function () {
        reclass('search', false, 'nodisplay');
        var ids = [].slice.call(document.querySelectorAll('table#provinces tbody tr')).map(function (el) {
            return el.id.toLowerCase();
        });

        var el = $('search');
        function filter() {
            try {
                var term = el.value.toLowerCase();
                ids.forEach(function (id) {
                    reclass(id, id.indexOf(term) < 0, 'nodisplay');
                });
                var empty = term.length === 0;
                reclass('provinces', empty, 'stripey');
                reclass('selective', !empty, 'nodisplay');
                if (!empty) {
                    reclass('provinces', false, 'selective');
                } else {
                    reclass('provinces', selective, 'selective');
                }
            } catch (e) {}
        }

        var timer;
        function debounce() {
            if (timer) clearTimeout(timer);
            timer = setTimeout(filter, 200);
        }

        if (el) el.addEventListener('input', debounce);
    };

    document.addEventListener('DOMContentLoaded', function (event) {
        try {
            setupFilter();
            setupSelective();
        } catch (e) {}
    });
})();
