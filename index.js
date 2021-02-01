const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid= require('uuid'),
mongoose = require('mongoose');
const { zip } = require('lodash');

const app = express();

// Requires models defined in models.js
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// Server connection
mongoose.connect("mongodb://localhost:27017/myFlixDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Middleware 
app.use(morgan('common')); // Logs IP addr, time, method, status code
app.use(bodyParser.json()); // read req.body of HTTP requests

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


let topMovies = [
    {
        id: `55`,
        title:`Team America: World Police`,
        genre:'Comedy',
        director: {
            name: `Tray Parker`,
            birth_year: `1969`,
            death_year: "",
            bio: "XXXXX"
        }
    },
    {
        id:`44`,
        title:'The Big Lebowski',
        genre: 'Comedy',
        director: {
            name:"Ethan Coen",
            birth_year:"1957",
            death_year: "",
            bio:"XXXXXX"
        }
    },
    {
        id: "66",
        title:`Anchorman: The Legend of Ron Burgundy`,
        genre:'Comedy',
        director: {
            name:`Adam McKay`,
            birth_year:`1968`,
            death_year: "",
            bio:`XXXXXX`
        }
    }
];

let users = [];




// Route calls
app.use(express.static('public'));

// GET REQUESTS 

app.get('/', (req, res) => {
    res.send('Hello there! Welcome to my movie API!');
});

// Returns all movies -- Done!
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Returns specific movie object by name -- Done!
app.get('/movies/:title', (req, res) =>{
    res.json(topMovies.find( (movie) => { 
        return movie.title === req.params.title
    }));
});

// Get all users
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a user by username
app.get('/users/:Username', (req,res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Returns single user object by ID
app.get('/users/:id', (req, res) =>{
    res.json(users.find( (user) => {
        return user.id === req.params.id
    }));
});

// Returns specific director object by name -- done!
app.get('/movies/directors/:name', (req, res) =>{
    res.json(topMovies.find( (movie) => {
        return movie.director.name === req.params.name
    }));
});

// Returns a list of all movies within a genre --Done!
app.get('/movies/genre/:genre', (req, res) =>{
    res.json(topMovies.filter( (movie) => {
        return movie.genre === req.params.genre
    }));
});

// POST REQUESTS 

//Adds new movie to the main list of movies --Done!
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

//Adds new user to our list of users.
app.post('/users', (req, res) =>{
    Users.findOne({ Username: req.body.Username }).then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users.create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }).then((user) => {res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});


//DELETE Requests

// Deletes a movie from our list by ID -- Done!
app.delete('/movies/:id', (req, res) => {
    let movie = topMovies.find((movie) => { return movie.id === req.params.id});

    if (movie) {
        topMovies = topMovies.filter((obj) => { return obj.id !== req.params.id });
        res.status(201).send('Movie with ID: ' + req.params.id + ' was deleted.');
    }
});

// Deletes a user from our list by ID
app.delete('/users/:id', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (user) {
        users = users.filter((obj) => { return obj.id !== req.params.id});
        res.status(201).send('User with ID: ' + req.params.id + ' was deleted.');
    }
});

//PUT Requests

// Update the name of user by id
app.put('/users/:id/:name', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (user) {
        user.name[req.params.name] = parseInt (req.params.name);
        res.status(201).send('User with ID: ' + req.params.id + ' was assigned the name of ' + req.params.name);
    } else {
        res.status(404).send('User with the ID: ' + req.params.id + ' was not found.');
    }
});

// Update the username of user by id
app.put('/users/:id/:user_name', (req, res) => {
    let user = users.find((user) => { return user.id === req.params.id});

    if (user) {
        user.name[req.params.user_name] = parseInt (req.params.user_name);
        res.status(201).send('User with ID: ' + req.params.id + ' was assigned the user name of ' + req.params.user_name);
    } else {
        res.status(404).send('User with the ID: ' + req.params.id + ' was not found.');
    }
});

// Update the title of a movie by title
app.put('/movies/:id/:title', (req, res) => {
    let movie = topMovies.find((movie) => { return movie.id === req.params.id});

    if (movie) {
        movie.title[req.params.title] = parseInt (req.params.title);
        res.status(201).send('Movie with ID: ' + req.params.id + ' was assigned the title of ' + req.params.title);
    } else {
        res.status(404).send('Movie with the ID: ' + req.params.id + ' was not found.');
    }
});


// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

