# KabarVirus

[![GitHub license](https://img.shields.io/github/license/ariya/kabarvirus)](https://github.com/ariya/kabarvirus/blob/master/LICENSE)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ariya/kabarvirus)
[![Node.js CI](https://github.com/ariya/kabarvirus/workflows/Node.js%20CI/badge.svg)](https://github.com/ariya/kabarvirus/actions)


[Bahasa Indonesia](#indonesian) | [English](#english)

---

### <a name="indonesian"></a>Bahasa Indonesia

Repositori ini menyimpan perkakas yang digunakan untuk membuat [KabarVirus.com](http://kabarvirus.com).

Tujuan KabarVirus adalah untuk menyajikan informasi _terpenting_ soal sebaran COVID-19 di Indonesia dengan _secepat-cepatnya_:

* Bobot halaman harus ringan: 10 KB atau kurang
* Skor [PageSpeed](https://developers.google.com/speed/pagespeed/insights): 98 atau lebih
* _Load time_ (menurut [Pingdom](https://tools.pingdom.com/)): 0,7 detik atau kurang
* Tetap berfungsi walaupun JavaScript dimatikan

Yang diperlukan: Node.js versi 10 atau yang lebih baru.

```
npm install
npm start
```

lalu buka alamat `localhost:8080`.

**CATATAN**: Berkas data `indonesia.json` harus Anda isi sendiri! Dalam contoh di repositori ini, isinya dibuat kosong (semua nilai adalah `0`). Bagaimana cara berburu data (yang tepat) tidak termasuk dalam lingkup proyek ini. Silakan cari dari instansi terkait maupun menggunakan layanan API kesayangan masing-masing.

<hr>

### <a name="english"></a>English

This repository contains the tools necessary to build  [KabarVirus.com](http://kabarvirus.com).

The goal of KabarVirus is to show the _important_ aspect of COVID-19 spread in Indonesian as _efficient_ as possible:

* Lightweight pages: 10 KB or less
* [PageSpeed score](https://developers.google.com/speed/pagespeed/insights): 98 or more
* _Load time_ (according [Pingdom](https://tools.pingdom.com/)): 0.7 sec or less
* Graceful degradation when JavaScript is disabled

Requirement: Node.js version 10 or newer.


```
npm install
npm start
```

and then open `localhost:8080`.

**NOTE**: You must fill the data file `indonesia.json`! A sample empty file (i.e. every number set to `0`) is included here. How to hunt for the accurate data is outside of the scope of this project. Please consult the proper agencies and/or use your favorite API services.