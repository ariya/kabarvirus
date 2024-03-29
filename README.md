# KabarVirus

[![GitHub license](https://img.shields.io/github/license/ariya/kabarvirus)](https://github.com/ariya/kabarvirus/blob/master/LICENSE)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ariya/kabarvirus)
[![Node.js CI](https://github.com/ariya/kabarvirus/workflows/Node.js%20CI/badge.svg)](https://github.com/ariya/kabarvirus/actions)
[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m785072355-3f442d6ed3d34f68ab65011e)](https://kabarvirus.com)


[Bahasa Indonesia](#indonesian) | [English](#english)

---

### <a name="indonesian"></a>Bahasa Indonesia

Repositori ini menyimpan perkakas yang digunakan untuk membuat [KabarVirus.com](http://kabarvirus.com).

Tujuan KabarVirus adalah untuk menyajikan informasi _terpenting_ soal sebaran COVID-19 di Indonesia dengan _secepat-cepatnya_:

* Bobot halaman harus ringan: 10 KB atau kurang
* Skor [PageSpeed](https://developers.google.com/speed/pagespeed/insights): 98 atau lebih
* _Load time_ (menurut [Pingdom](https://tools.pingdom.com/)): 0,7 detik atau kurang
* Tetap berfungsi walaupun JavaScript dimatikan

Yang diperlukan (versi minimum): [Node.js](https://nodejs.org) versi 16, [curl](https://curl.haxx.se) versi 7.58.

```
npm install
npm run build
npm start
```

lalu buka alamat `localhost:8080`.

**CATATAN**: Data paparan COVID-19 diekstrak dari [dashboard resmi ArcGIS milik BNPB](https://inacovid19.maps.arcgis.com) (Badan Nasional Penanggulangan Bencana). Untuk lebih rincinya, lihat juga [github.com/ariya/dekontaminasi](https://github.com/ariya/dekontaminasi).

<hr>

### <a name="english"></a>English

This repository contains the tools necessary to build  [KabarVirus.com](http://kabarvirus.com).

The goal of KabarVirus is to show the _important_ aspect of COVID-19 spread in Indonesian as _efficient_ as possible:

* Lightweight pages: 10 KB or less
* [PageSpeed score](https://developers.google.com/speed/pagespeed/insights): 98 or more
* _Load time_ (according [Pingdom](https://tools.pingdom.com/)): 0.7 sec or less
* Graceful degradation when JavaScript is disabled

Minimum requirements: [Node.js](https://nodejs.org) version 16, [curl](https://curl.haxx.se) version 7.58.

```
npm install
npm run build
npm start
```

and then open `localhost:8080`.

**NOTE**: The information on COVID-19 spread is extracted from [the official ArcGIS dashboard of BNPB](https://inacovid19.maps.arcgis.com/) (National Disaster Mitigation Agency). For more details, refer to [github.com/ariya/dekontaminasi](https://github.com/ariya/dekontaminasi).

