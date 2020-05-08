#!/usr/bin/env node

const fs = require('fs');

const cleanCSS = require('clean-css');
const mustache = require('mustache');
const uglifyJS = require('uglify-js');

// https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance

function damlevDistance(a, b) {
    if (!a || a.length === 0) return !b || b.length === 0 ? 0 : b.length;
    if (!b || b.length === 0) return a.length;

    const lengthA = a.length;
    const lengthB = b.length;
    const maxDist = lengthA + lengthB;

    let d = [];
    d[0] = [maxDist];

    for (let i = 0; i <= lengthA; i++) {
        d[i + 1] = [];
        d[i + 1][1] = i;
        d[i + 1][0] = maxDist;
    }
    for (let i = 0; i <= lengthB; i++) {
        d[1][i + 1] = i;
        d[0][i + 1] = maxDist;
    }

    let da = {};
    const sigma = a + b;
    for (let i = 0; i < sigma.length; i++) if (!da.hasOwnProperty(sigma[i])) da[sigma[i]] = 0;

    for (let i = 1; i <= lengthA; i++) {
        let db = 0;
        for (let j = 1; j <= lengthB; j++) {
            let k = da[b[j - 1]];
            let l = db;

            if (a[i - 1] == b[j - 1]) {
                d[i + 1][j + 1] = d[i][j];
                db = j;
            } else {
                d[i + 1][j + 1] = Math.min(d[i][j], Math.min(d[i + 1][j], d[i][j + 1])) + 1;
            }
            d[i + 1][j + 1] = Math.min(d[i + 1][j + 1], d[k][l] + (i - k) + (j - l - 1));
        }
        da[a[i - 1]] = i;
    }
    return d[lengthA + 1][lengthB + 1];
}

function fuzzyMatch(list, name) {
    const distances = list.map((p) => {
        return {
            name: p,
            score: damlevDistance(p, name)
        };
    });
    return distances.sort((x, y) => x.score - y.score).shift();
}

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
    const allHospitals = JSON.parse(fs.readFileSync('hospitals.json', 'utf-8').toString())
        .map((h) => {
            let hh = {};
            Object.keys(h).forEach((k) => (hh[k] = typeof h[k] === 'string' ? h[k].trim() : h[k]));
            if (!metadata[hh.province]) {
                const match = fuzzyMatch(Object.keys(metadata), hh.province);
                console.log(`Missing ${hh.province}: closest match is ${match.name} [score = ${match.score}]`);
                hh.province = match.name;
            }
            return hh;
        })
        .map((h) => {
            const skipName = h.description.indexOf('TNI') > 0 || h.description.indexOf('Polri') > 0;
            const q = skipName ? h.address : h.name + ' ' + h.address;
            return {
                ...h,
                map: 'https://www.google.com/maps/search/' + encodeURI(q + ' Indonesia')
            };
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

        function score(h) {
            let s = 0;
            if (h.address && h.address.toLowerCase().indexOf(meta.capital.toLowerCase()) > 0) s += 100;
            if (h.name.toLowerCase().indexOf(meta.capital.toLowerCase()) > 0) s += 100;
            if (h.description.indexOf('Kemenkes') > 0) s += 50;
            if (h.description.indexOf('Laboratorium') > 0) s += 30;
            return s;
        }
        const hospitals = allHospitals.filter((h) => h.province === name).sort((h1, h2) => score(h2) - score(h1));
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
