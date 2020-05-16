#!/usr/bin/env node

const fs = require('fs');

const cleanCSS = require('clean-css');
const mustache = require('mustache');
const uglifyJS = require('uglify-js');

function mkdirp(dirname) {
    try {
        fs.mkdirSync(dirname);
    } catch (e) {
        // ignore, directory already exists
    }
}

function generate() {
    const metadata = JSON.parse(fs.readFileSync('metadata.json', 'utf-8').toString());
    Object.keys(metadata).forEach((key) => {
        const region = metadata[key];
        const match = /([a-z]+)prov/.exec(region.website);
        if (match && match.length === 2 && region.slug !== match[1])
            console.warn(`Incompatible slug (perhaps website has changed?): ${region.slug} vs ${match[1]}`);
    });

    const stats = JSON.parse(fs.readFileSync('stats.json', 'utf-8').toString());

    const allHospitals = !fs.existsSync('hospitals.json')
        ? []
        : JSON.parse(fs.readFileSync('hospitals.json', 'utf-8').toString()).map((h) => {
              const skipName = h.description.indexOf('TNI') > 0 || h.description.indexOf('Polri') > 0;
              const q = skipName ? h.address : h.name + ' ' + h.address;
              return {
                  ...h,
                  map: 'https://www.google.com/maps/search/' + encodeURI(q + ' Indonesia')
              };
          });

    // news and hoaxes: an array of object, each with `title` and `url` properties.
    let news = [];
    if (fs.existsSync('news.json')) {
        news = JSON.parse(fs.readFileSync('news.json', 'utf-8').toString());
        for (let k = 0; k < 7; ++k) {
            // Vary the most recent articles
            for (let i = 0; i < news.length; i += 5) {
                let sub = news.splice(i, 6);
                sub.sort((p, q) => Math.random() - 0.5);
                news = news.slice(0, i).concat(sub).concat(news.slice(i));
            }
            if (
                news[0].source !== news[1].source &&
                news[1].source !== news[2].source &&
                news[0].source !== news[2].source
            )
                break;
        }
    }
    const allHoaxes = !fs.existsSync('hoaxes.json')
        ? []
        : JSON.parse(fs.readFileSync('hoaxes.json', 'utf-8').toString());

    const include = {};
    const fnames = [
        'meta.mustache',
        'header.mustache',
        'footer.mustache',
        'style.css',
        'animation.js',
        'filter.js',
        'locate.js'
    ];
    fnames.forEach((name) => {
        const filename = `template/${name}`;
        let content = fs.readFileSync(filename, 'utf-8').toString();
        const key = name.replace('.mustache', '').replace('.', '-');
        include[key] = content;
        if (name.indexOf('.js') > 0) {
            content = uglifyJS.minify(content).code;
        } else if (name.indexOf('.css') > 0) {
            const process = new cleanCSS({}).minify(content);
            content = process.styles;
        }
        include[key] = content;
    });

    let timestamp = null;
    if (fs.existsSync('update.timestamp')) {
        const updateContent = fs.readFileSync('update.timestamp', 'utf-8').toString().trim();
        const unixEpoch = parseInt(updateContent, 10);
        if (Number.isNaN(unixEpoch)) {
            console.error('Invalid update timestamp', updateContent);
        } else {
            const jakartaTZOffset = 7;
            const updateDateTime = new Date(unixEpoch + jakartaTZOffset * 60 * 60 * 1000);
            const monthNames = 'JanFebMarAprMeiJunJulAgtSepOktNovDes';
            timestamp = [
                updateDateTime.getDate(),
                monthNames.substr(3 * updateDateTime.getMonth(), 3),
                updateDateTime.toISOString().substr(11, 5),
                'WIB'
            ].join(' ');
        }
    }

    function format(numbers) {
        ['infected', 'recovered', 'fatal'].forEach((key) => {
            // Adapted from https://stackoverflow.com/a/2901298/2399252
            numbers[key] = numbers[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        });
        return numbers;
    }

    stats.numbers = format(stats.numbers);
    stats.regions.forEach((prov) => {
        const name = prov.name;
        prov.url = '/' + metadata[name].slug + '/';
        prov.numbers = format(prov.numbers);
        prov.id = name.replace(/\s/g, '').toLowerCase() + ' ' + metadata[name].slug;
    });
    const previewCount = 3;
    const preview = news.length >= previewCount;
    const snippets = preview ? news.slice(0, previewCount) : [];
    const hoaxes = allHoaxes.slice(0, 3);
    const hoaxesCount = hoaxes.length;
    const indexData = { timestamp, include, stats, preview, snippets, hoaxesCount, hoaxes };
    const indexTemplate = fs.readFileSync('template/index.mustache', 'utf-8').toString();
    const intermediateIndex = mustache.render(indexTemplate, indexData);
    const indexHtml = mustache.render(intermediateIndex, indexData);
    mkdirp('public');
    fs.writeFileSync('public/index.html', indexHtml);

    stats.regions.forEach((prov) => {
        const name = prov.name;
        const meta = metadata[name];
        mkdirp('public/' + meta.slug);
        const link = meta.website.replace('https://', '').replace('http://', '');
        const numbers = format(prov.numbers);
        const hospitals = allHospitals.filter((h) => h.province === name);
        const regionData = {
            timestamp,
            include,
            meta: { ...meta, link },
            stats: { name, numbers },
            totalHospitals: hospitals.length,
            hospitals
        };
        const regionTemplate = fs.readFileSync('template/region.mustache', 'utf-8').toString();
        const intermediateRegion = mustache.render(regionTemplate, regionData);
        const regionHtml = mustache.render(intermediateRegion, regionData);
        fs.writeFileSync('public/' + meta.slug + '/index.html', regionHtml);
    });

    const newsData = { include, news };
    const newsTemplate = fs.readFileSync('template/news.mustache', 'utf-8').toString();
    const intermediateNews = mustache.render(newsTemplate, newsData);
    const newsHtml = mustache.render(intermediateNews, newsData);
    mkdirp('public/berita');
    fs.writeFileSync('public/berita/index.html', newsHtml);

    fs.copyFileSync('template/favicon.ico', 'public/favicon.ico');
    fs.copyFileSync('template/404.html', 'public/404.html');
}

module.exports = generate;

generate();
