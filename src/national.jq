[
    .features | .[] | .attributes |
    {
        type: "country",
        name: "Indonesia",
        numbers: {
            infected: .Jumlah_Kasus_Kumulatif,
            recovered: .Jumlah_Pasien_Sembuh,
            fatal: .Jumlah_Pasien_Meninggal
        }
    }
] | map(select(.numbers.infected)) | .[-1]
