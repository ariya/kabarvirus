const chokidar = require('chokidar');
const liveServer = require('alive-server');

const generate = require('./generate');

chokidar.watch('template/*').on('change', generate);
chokidar.watch('*.json').on('change', generate);

liveServer.start({ root: './public' });
generate();
