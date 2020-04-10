#!/usr/bin/env node

const fs = require('fs');

const mustache = require('mustache');

function generate() {
    const include = {};
    const fnames = ['meta.mustache', 'header.mustache', 'footer.mustache', 'style.css'];
    fnames.forEach((name) => {
        const filename = `template/${name}`;
        let content = fs.readFileSync(filename, 'utf-8').toString();
        const key = name.replace('.mustache', '').replace('.', '-');
        include[key] = content;
    });

    const indexData = { include };
    const indexTemplate = fs.readFileSync('template/index.mustache', 'utf-8').toString();
    const intermediateIndex = mustache.render(indexTemplate, indexData);
    const indexHtml = mustache.render(intermediateIndex, indexData);
    fs.writeFileSync('public/index.html', indexHtml);
}

module.exports = generate;

generate();
