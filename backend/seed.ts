await db
.insert(genres)
.values([
    { name: 'Action' },
    { name: 'Thriller' },
    { name: 'Drama' },
    { name: 'Sports' },
    { name: 'Biography' },
    { name: 'Romance' },
])

await db.insert(movies).values([
{
    title: 'The Gorge',
    description:
        'Two highly-trained operatives are appointed to posts in guard towers on opposite sides of a vast and highly classified gorge, protecting the world from a mysterious evil that lurks within. They work together to keep the secret in the gorge.',
    releaseDate: '2025-02-14',
    rating: 70,
    image:
        'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSBcutt8c7S-kokoBHXWNchEIJ76nASu7qcywamV6p9s8ofWfmc',
    trailer: 'https://www.youtube.com/watch?v=rUSdnuOLebE',
},
{
    title: 'John Wick',
    description:
        'An ex-hitman comes out of retirement to track down the gangsters that killed his dog and took everything from him.',
    releaseDate: '2014-10-24',
    rating: 86,
    image:
        'https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_FMjpg_UY2048_.jpg',
    trailer: 'https://www.youtube.com/watch?v=l1g0fn5Nm_g',
},
{
    title: 'The Gray Man',
    description:
        "When the CIA's top asset uncovers agency secrets, he triggers a global hunt by assassins set loose by his ex-colleague.",
    releaseDate: '2022-07-22',
    rating: 46,
    image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIIEieA60s045REMTi5Y-h7jFXOQ3uXKqMdrdyMe4wW9QQJnYo',
    trailer: 'https://www.youtube.com/watch?v=BmllggGO4pM',
},
{
    title: 'Manchester by the Sea',
    description:
        "After his brother's death, Lee Chandler is named guardian to his 16-year-old nephew, Patrick. This forces him to return to his hometown and confront his past.",
    releaseDate: '2016-11-18',
    rating: 96,
    image:
        'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRZLuEiplcmrl-b-LV8K3RfiN_ba4W4GyPJPIy8ZDfifsQGuRjm',
    trailer: 'https://www.youtube.com/watch?v=obdKk_sYQNI',
},
{
    title: 'Jerry Maguire',
    description:
        'When a sports agent has a moral epiphany and is fired for expressing it, he decides to put his new philosophy to the test as an independent agent with the only athlete who stays with him and his former colleague.',
    releaseDate: '1996-12-13',
    rating: 84,
    image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9CLFPbAVnFpw0ADO1s7ytSx1o6SnPDHLiLSmY-BsqinpnSrrb',
    trailer: 'https://www.youtube.com/watch?v=KUd3gwaf0KQ',
},
{
    title: 'Moneyball',
    description:
        'Oakland Athletics general manager Billy Beane decides to challenge the old school selection methods. He sets off to assemble a baseball team using an innovative computer-generated analysis.',
    releaseDate: '2011-09-23',
    rating: 94,
    image:
        'https://m.media-amazon.com/images/M/MV5BMjAxOTU3Mzc1M15BMl5BanBnXkFtZTcwMzk1ODUzNg@@._V1_FMjpg_UY2048_.jpg',
    trailer: 'https://www.youtube.com/watch?v=D1R-LwHbld4',
},
])

// Add movie-genre relationships
await db.insert(movieToGenre).values([
    // The Gorge - Action, Thriller
    { movieId: 1, genreId: 1 },
    { movieId: 1, genreId: 2 },
    
    // John Wick - Action, Thriller
    { movieId: 2, genreId: 1 },
    { movieId: 2, genreId: 2 },
    
    // The Gray Man - Action, Thriller
    { movieId: 3, genreId: 1 },
    { movieId: 3, genreId: 2 },
    
    // Manchester by the Sea - Drama
    { movieId: 4, genreId: 3 },
    
    // Jerry Maguire - Drama, Romance, Sports
    { movieId: 5, genreId: 3 },
    { movieId: 5, genreId: 6 },
    { movieId: 5, genreId: 4 },
    
    // Moneyball - Drama, Sports, Biography
    { movieId: 6, genreId: 3 },
    { movieId: 6, genreId: 4 },
    { movieId: 6, genreId: 5 }
])