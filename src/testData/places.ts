const places = [
    {
        "Name": "Phoenix",
        "County": "Maricopa",
        "Population": 1445632,
        "Population data source and year": "2010 census",
        "Latitude": 33.448376,
        "Longitude": -112.074036
    },
    {
        "Name": "Tucson",
        "County": "Pima",
        "Population": 520116,
        "Population data source and year": "2010 census",
        "Latitude": 32.25346,
        "Longitude": -110.911789
    },
    {
        "Name": "Mesa",
        "County": "Maricopa",
        "Population": 439041,
        "Population data source and year": "2010 census",
        "Latitude": 33.424564,
        "Longitude": -111.833267
    },
    {
        "Name": "Chandler",
        "County": "Maricopa",
        "Population": 236123,
        "Population data source and year": "2010 census",
        "Latitude": 33.307575,
        "Longitude": -111.84494
    },
    {
        "Name": "Glendale",
        "County": "Maricopa",
        "Population": 226721,
        "Population data source and year": "2010 census",
        "Latitude": 33.548264,
        "Longitude": -112.191696
    },
    {
        "Name": "Scottsdale",
        "County": "Maricopa",
        "Population": 217385,
        "Population data source and year": "2010 census",
        "Latitude": 33.501324,
        "Longitude": -111.925278
    },
    {
        "Name": "Gilbert",
        "County": "Maricopa",
        "Population": 208453,
        "Population data source and year": "2010 census",
        "Latitude": 33.360355,
        "Longitude": -111.801682
    },
    {
        "Name": "Tempe",
        "County": "Maricopa",
        "Population": 161719,
        "Population data source and year": "2010 census",
        "Latitude": 33.412778,
        "Longitude": -111.943056
    },
    {
        "Name": "Peoria",
        "County": "Maricopa",
        "Population": 154065,
        "Population data source and year": "2010 census",
        "Latitude": 40.703545,
        "Longitude": -89.579086
    },
    {
        "Name": "Surprise",
        "County": "Maricopa",
        "Population": 117517,
        "Population data source and year": "2010 census",
        "Latitude": 33.630556,
        "Longitude": -112.366667
    },
    {
        "Name": "Yuma",
        "County": "Yuma",
        "Population": 93064,
        "Population data source and year": "2010 census",
        "Latitude": 32.692222,
        "Longitude": -114.615278
    },
    {
        "Name": "Avondale",
        "County": "Maricopa",
        "Population": 76238,
        "Population data source and year": "2010 census",
        "Latitude": 33.435596,
        "Longitude": -112.349602
    },
    {
        "Name": "Flagstaff",
        "County": "Coconino",
        "Population": 65870,
        "Population data source and year": "2010 census",
        "Latitude": 35.198284,
        "Longitude": -111.651299
    },
    {
        "Name": "Goodyear",
        "County": "Maricopa",
        "Population": 65275,
        "Population data source and year": "2010 census",
        "Latitude": 33.45,
        "Longitude": -112.358333
    },
    {
        "Name": "Lake Havasu City",
        "County": "Mohave",
        "Population": 52527,
        "Population data source and year": "2010 census",
        "Latitude": 34.49,
        "Longitude": -114.308889
    },
    {
        "Name": "Buckeye",
        "County": "Maricopa",
        "Population": 50876,
        "Population data source and year": "2010 census",
        "Latitude": 33.370556,
        "Longitude": -112.590833
    },
    {
        "Name": "Casa Grande",
        "County": "Pinal",
        "Population": 48571,
        "Population data source and year": "2010 census",
        "Latitude": 32.885833,
        "Longitude": -111.743889
    },
    {
        "Name": "Sierra Vista",
        "County": "Cochise",
        "Population": 43888,
        "Population data source and year": "2010 census",
        "Latitude": 31.545556,
        "Longitude": -110.276389
    },
    {
        "Name": "Maricopa",
        "County": "Pinal",
        "Population": 43482,
        "Population data source and year": "2010 census",
        "Latitude": 33.056667,
        "Longitude": -112.046667
    },
    {
        "Name": "Oro Valley",
        "County": "Pima",
        "Population": 41011,
        "Population data source and year": "2010 census",
        "Latitude": 32.421111,
        "Longitude": -110.976111
    },
    {
        "Name": "Prescott",
        "County": "Yavapai",
        "Population": 39843,
        "Population data source and year": "2010 census",
        "Latitude": 34.541667,
        "Longitude": -112.469444
    },
    {
        "Name": "Bullhead City",
        "County": "Mohave",
        "Population": 39540,
        "Population data source and year": "2010 census",
        "Latitude": 35.115556,
        "Longitude": -114.588611
    },
    {
        "Name": "Prescott Valley",
        "County": "Yavapai",
        "Population": 38822,
        "Population data source and year": "2010 census",
        "Latitude": 34.602222,
        "Longitude": -112.321944
    },
    {
        "Name": "Apache Junction",
        "County": "Pinal",
        "Population": 35840,
        "Population data source and year": "2010 census",
        "Latitude": 33.415,
        "Longitude": -111.546111
    },
    {
        "Name": "Marana",
        "County": "Pima",
        "Population": 34961,
        "Population data source and year": "2010 census",
        "Latitude": 32.386667,
        "Longitude": -111.125556
    },
    {
        "Name": "El Mirage",
        "County": "Maricopa",
        "Population": 31797,
        "Population data source and year": "2010 census",
        "Latitude": 33.608889,
        "Longitude": -112.324722
    },
    {
        "Name": "Kingman",
        "County": "Mohave",
        "Population": 28068,
        "Population data source and year": "2010 census",
        "Latitude": 35.208333,
        "Longitude": -114.025833
    },
    {
        "Name": "Queen Creek",
        "County": "Maricopa",
        "Population": 26361,
        "Population data source and year": "2010 census",
        "Latitude": 33.263056,
        "Longitude": -111.634722
    },
    {
        "Name": "Florence",
        "County": "Pinal",
        "Population": 25536,
        "Population data source and year": "2010 census",
        "Latitude": 33.038611,
        "Longitude": -111.386944
    },
    {
        "Name": "San Luis",
        "County": "Yuma",
        "Population": 25505,
        "Population data source and year": "2010 census",
        "Latitude": 32.496111,
        "Longitude": -114.768333
    },
    {
        "Name": "Sahuarita",
        "County": "Pima",
        "Population": 25259,
        "Population data source and year": "2010 census",
        "Latitude": 31.929167,
        "Longitude": -110.982222
    },
    {
        "Name": "Fountain Hills",
        "County": "Maricopa",
        "Population": 22489,
        "Population data source and year": "2010 census",
        "Latitude": 33.6,
        "Longitude": -111.72
    },
    {
        "Name": "Nogales",
        "County": "Santa Cruz",
        "Population": 20837,
        "Population data source and year": "2010 census",
        "Latitude": 31.353889,
        "Longitude": -110.939167
    }
]

export default places;