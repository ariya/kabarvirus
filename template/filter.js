(function () {
    var $ = function (id) {
        return document.getElementById(id);
    };
    var reclass = function (id, condition, className) {
        var el = $(id);
        if (condition) el.classList.add(className);
        else el.classList.remove(className);
    };
    var selective = false;
    var setupSelective = function () {
        var btn = $('selective');
        reclass('selective', false, 'nodisplay');
        function toggleSelective() {
            selective = !selective;
            reclass('provinces', selective, 'selective');
            reclass('selective', !selective, 'outline');
            btn.innerHTML = selective ? '&#x25BC; Tampilkan Semua Provinsi' : '&#x25B2; Hanya 7 Besar';
            btn.blur();
        }
        btn.addEventListener('click', toggleSelective);
        toggleSelective();
    };
    document.addEventListener('DOMContentLoaded', function (event) {
        try {
            setupSelective();
        } catch (e) {}
    });
})();
