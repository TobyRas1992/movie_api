const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid= require('uuid'); 

const app = express();

app.use(bodyParser.json());

let topMovies = [
    {
        title: 'Team America: World Police',
        genre: 'Comedy',
        director: {
            name: "Tray Parker",
            birth_year: "1969",
            bio: "XXXXX"
        }
    },
    {
        id: 44,
        title: 'The Big Lebowski',
        genre: 'Comedy',
        director: {
            name: "Ethan Coen",
            birth_year: "1957",
            bio: "XXXXXX"
        }
    },
    {
        title: 'Anchorman: The Legend of Ron Burgundy',
        genre: 'comedy',
        director: {
            name: "Adam McKay",
            birth_year: "1968",
            bio: "XXXXXX"
        }
    }
];

let users = [
    {
        id: 1234,
        name: "Mock User",
        user_name: "Mock123"
    }
];

app.use(morgan('common'));


app.use(express.static('public'));


// Route calls
app.get('/', (req, res) => {
    res.send('Welcome to a database of my favorite movies!');
});

// Gets a list of data about ALL the movies
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Gets the data about a single movie, by its title
app.get('/movies/:title', (req, res) =>{
    res.json(topMovies.find( (movie) => 
        { return movie.title === req.params.title}));
});

// Gets data about a single user, by their ID -- Doesn't work
app.get('/users/:id', (req, res) =>{
    res.json(users.find( (user) => 
        { return user.id === req.params.id}));
});

// Gets data about a single director, by his/her name -- this doesn't work for some reason??
app.get('/movies/directors/:name', (req, res) =>{
    res.json(topMovies.find( (movie) => 
        { return topMovies.director.name === req.params.name}));
});

// Gets a list of all movies within a genre -- Doesn't work
app.get('/movies/:genre', (req, res) =>{
    res.json(topMovies.find( (movie) => 
        { return movie.genre === req.params.genre}));
});

//Adds data for a new movie to our list of movies -- doesn't work! 
app.post ('/movies', (req, res) => {
    let newMovie = req.body;

    if (!newMovie.title) {
        const message = 'Missing title in request body';
        res.status(400).send(message);
    } else {
        newMovie.id = uuid.v4();
        topMovies.push(newMovie);
        res.status(201).send(newMovie);
    }
});

//Adds data for a new user to our list of users. -- Doesn't work! 
app.post ('/users', (req, res) => {
    let newUser = req.body;

    if (!newUser.name) {
        const message = 'Missing name in request body';
        res.status(400).send(message);
    } else if (!newUser.user_name) {
        const message = 'Missing user name in request body';
    } else {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

// Deletes a movie from our list by ID -- doesn't work!
app.delete('/movies/:id', (req, res) => {
    let movie = topMovies.find((movie) => { return movie.id === req.params.id});

    if (X) {
        topMovies = topMovies.filter((obj) => { return obj.id !== req.params.id });
        res.status(201).send('Movie with ID: ' + req.params.id + ' was deleted.');
    }
});
// Deletes a user from our list by ID
app.delete('/users/:id', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (X) {
        users = users.filter((obj) => { return obj.id !== req.params.id});
        res.status(201).send('User with ID: ' + req.params.id + ' was deleted.');
    }
});

// Update the name of user by, by id
app.put('/users/:id/:name', (req, res) => {
    let user = user.find((user) => { return user.id === req.params.id});

    if (user) {
        user.name[req.params.name] = parseInt (req.params.name);
        res.status(201).send('User with ID: ' + req.params.id + ' was assigned the name of ' + req.params.name);
    } else {
        res.status(404).send('User with the ID: ' + req.params.id + ' was not found.');
    }
});

// Update the user name of user by, by id
app.put('/users/:id/:user_name', (req, res) => {
    let user = user.find((user) => { return user.id === req.params.id});

    if (user) {
        user.name[req.params.user_name] = parseInt (req.params.user_name);
        res.status(201).send('User with ID: ' + req.params.id + ' was assigned the user name of ' + req.params.user_name);
    } else {
        res.status(404).send('User with the ID: ' + req.params.id + ' was not found.');
    }
});

// Update the title of a movie, by movie title
app.put('/movies/:id/:title', (req, res) => {
    let movie = topMovies.find((movie) => { return movie.id === req.params.id});

    if (movie) {
        movie.title[req.params.title] = parseInt (req.params.title);
        res.status(201).send('Movie with ID: ' + req.params.id + ' was assigned the title of ' + req.params.title);
    } else {
        res.status(404).send('Movie with the ID: ' + req.params.id + ' was not found.');
    }
});


// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

