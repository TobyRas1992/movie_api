const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid= require('uuid'),
mongoose = require('mongoose'),
Models = require('./models.js'); 

const app = express(),
Movies = Models.Movie,
Users = Models.User; // Models.Movie and Models.User refer to the model names I defined in the models.js file.

mongoose.connect('mongodb://localhost:27017//myFlixDB', { useNewURLParser: true, useUnifiedTopology: true}); // allows Mongoose to connect to my database so that it can perform CRUD operations on the documents it contains from within your REST API. 

app.use(bodyParser.json());

app.use(morgan('common'));

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

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

let users = [
    {
        id:"A1234",
        name:"Mock User",
        username:"Mock123",
        email:"mockemail@yahoo.com"
    }
];




// Route calls
app.use(express.static('public'));

// GET REQUESTS 

app.get('/', (req, res) => {
    res.send('Hello there! Welcome to the movie club!');
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

//Adds new user to our list of users (old way).
// app.post ('/users', (req, res) => {
//     let newUser = req.body;

//     if (!newUser.name) {
//         const message = 'Missing name in request body';
//         res.status(400).send(message);
//     } else if (!newUser.user_name) {
//         const message = 'Missing user name in request body';
//     } else {
//         newUser.id = uuid.v4();
//         users.push(newUser);
//         res.status(201).send(newUser);
//     }
// });

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


// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

