const chokidar = require('chokidar');
const liveServer = require('live-server');

const generate = require('./generate');

chokidar.watch('template/*').on('change', generate);
chokidar.watch('*.json').on('change', generate);

liveServer.start({ root: './public' });
generate();
