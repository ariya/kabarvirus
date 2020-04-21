[
    .features | .[] | .attributes |
    {
        type: "province",
        name: .Provinsi,
        numbers:
        {
            infected: .Kasus_Posi,
            recovered : .Kasus_Semb,
            fatal: .Kasus_Meni
        }
    }
]
