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

    const nationalStats = JSON.parse(fs.readFileSync('national.json', 'utf-8').toString());
    const hasProvincesStats = fs.existsSync('provinces.json');
    const provincesStats = !hasProvincesStats
        ? []
        : JSON.parse(fs.readFileSync('provinces.json', 'utf-8').toString())
              .sort((p, q) => q.numbers.infected - p.numbers.infected)
              .map((p) => {
                  return {
                      type: p.type,
                      name: p.name.replace('Daerah Istimewa', 'DI').replace('Kepulauan', 'Kep.'),
                      numbers: p.numbers
                  };
              });
    const allHospitals = JSON.parse(fs.readFileSync('hospitals.json', 'utf-8').toString()).map((h) => {
        let hh = {};
        Object.keys(h).forEach((k) => (hh[k] = typeof h[k] === 'string' ? h[k].trim() : h[k]));
        return hh;
    });

    /* news is an array of object, each with `title` and `url` properties.
       Example:
         [
           {
            "title": "Pemerintah Setujui Status PSBB untuk Tangerang dan Tangsel",
            "url": "https://nasional.tempo.co/read/1330740/pemerintah-setujui-status-psbb-untuk-tangerang-dan-tangsel"
           }
        ]
    */
    let news = [];
    if (fs.existsSync('news.json')) {
        news = JSON.parse(fs.readFileSync('news.json', 'utf-8').toString());
    }

    const include = {};
    const fnames = ['meta.mustache', 'header.mustache', 'footer.mustache', 'style.css', 'animation.js', 'filter.js'];
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
            let minutes = updateDateTime.getMinutes().toString();
            if (minutes.length < 2) minutes = '0' + minutes;
            timestamp = [
                updateDateTime.getDate(),
                monthNames.substr(3 * updateDateTime.getMonth(), 3),
                updateDateTime.getHours() + ':' + minutes,
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

    const stats = { ...nationalStats, regions: provincesStats };
    stats.numbers = format(stats.numbers);
    stats.regions.forEach((prov) => {
        const name = prov.name;
        prov.url = '/' + metadata[name].slug + '/';
        prov.numbers = format(prov.numbers);
        prov.id = name.replace(/\s/g, '').toLowerCase() + ' ' + metadata[name].slug;
    });
    const previewCount = hasProvincesStats ? 3 : 10;
    const preview = news.length >= previewCount;
    const snippets = preview ? news.slice(0, previewCount) : [];
    const indexData = { timestamp, include, stats, hasProvincesStats, preview, snippets };
    const indexTemplate = fs.readFileSync('template/index.mustache', 'utf-8').toString();
    const intermediateIndex = mustache.render(indexTemplate, indexData);
    const indexHtml = mustache.render(intermediateIndex, indexData);
    mkdirp('public');
    fs.writeFileSync('public/index.html', indexHtml);

    provincesStats.forEach((prov) => {
        const name = prov.name;
        const meta = metadata[name];
        mkdirp('public/' + meta.slug);
        const link = meta.website.replace('https://', '').replace('http://', '');
        const numbers = format(prov.numbers);
        const hospitals = allHospitals.filter((h) => h.province === name);
        const showHospitals = hospitals.length > 0;
        const regionData = {
            timestamp,
            include,
            meta: { ...meta, link },
            stats: { name, numbers },
            showHospitals,
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
}

module.exports = generate;

generate();
