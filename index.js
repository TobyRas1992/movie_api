const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid= require('uuid'); 

const app = express();

app.use(bodyParser.json());

let topMovies = [
    {
        "id": `55`,
        "title":`Team America: World Police`,
        "genre":`Comedy`,
        "director": {
            "name": `Tray Parker`,
            "birth_year": `1969`,
            "bio": "XXXXX"
        }
    },
    {
        "id":`44`,
        "title":'The Big Lebowski',
        "genre": 'Comedy',
        "director": {
            "name":"Ethan Coen",
            "birth_year":"1957",
            "bio":"XXXXXX"
        }
    },
    {
        "id": "66",
        "title":`Anchorman: The Legend of Ron Burgundy`,
        "genre":`Comedy`,
        "director": {
            "name":`Adam McKay`,
            "birth_year":`1968`,
            "bio":`XXXXXX`
        }
    }
];

let users = [
    {
        "id":"1234",
        "name":"Mock User",
        "username":"Mock123",
        "email":"mockemail@yahoo.com"
    }
];

app.use(morgan('common'));


app.use(express.static('public'));


// Route calls
app.get('/', (req, res) => {
    res.send('Welcome to a database of my favorite movies!');
});

// Gets a list of data about ALL the movies -- Done!
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Gets the data about a single movie, by its title -- done!
app.get('/movies/:movieTitle', (req, res) =>{
    res.json(topMovies.find( (movie) => 
        { return movie.title === req.params.title}));
});

// Gets data about a single user, by their ID
app.get('/users/:userID', (req, res) =>{
    res.json(users.find( (user) => 
        { return user.id === req.params.id}));
});

// Gets data about a single director, by his/her name -- done!
app.get('/movies/directors/:nameName', (req, res) =>{
    res.json(topMovies.find( (movie) => 
        { return movie.director.name === req.params.name}));
});

// Gets a list of all movies within a genre -- Done!
app.get('/movies/genre/:genre', (req, res) =>{
    res.json(topMovies.find( (movie) => 
        { return movie.genre === req.params.genre}));
});

//Adds data for a new movie to the main list of movies
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

//Adds data for a new user to our list of users. 
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

// Deletes a movie from our list by ID -- Done!
app.delete('/movies/:movieID', (req, res) => {
    let movie = topMovies.find((movie) => { return movie.id === req.params.id});

    if (movie) {
        topMovies = topMovies.filter((obj) => { return obj.id !== req.params.id });
        res.status(201).send('Movie with ID: ' + req.params.id + ' was deleted.');
    }
});

// Deletes a user from our list by ID
app.delete('/users/:userID', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (user) {
        users = users.filter((obj) => { return obj.id !== req.params.id});
        res.status(201).send('User with ID: ' + req.params.id + ' was deleted.');
    }
});

// Update the name of user by, by id
app.put('/users/:userID/:name', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (user) {
        user.name[req.params.name] = parseInt (req.params.name);
        res.status(201).send('User with ID: ' + req.params.id + ' was assigned the name of ' + req.params.name);
    } else {
        res.status(404).send('User with the ID: ' + req.params.id + ' was not found.');
    }
});

// Update the username of user by, by id
app.put('/users/:userID/:user_name', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (user) {
        user.name[req.params.user_name] = parseInt (req.params.user_name);
        res.status(201).send('User with ID: ' + req.params.id + ' was assigned the user name of ' + req.params.user_name);
    } else {
        res.status(404).send('User with the ID: ' + req.params.id + ' was not found.');
    }
});

// Update the title of a movie, by movie title
app.put('/movies/:movieID/:movieTitle', (req, res) => {
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

