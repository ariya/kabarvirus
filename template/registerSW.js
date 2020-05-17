function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.register('./serviceWorker.js');
        } catch (e) {
            console.log('Service Worker registration failed', e);
        }
    }
}

window.addEventListener('load', function () {
    registerServiceWorker();
});
