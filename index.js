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
const Genres = Models.Genre;
const Directors = Models.Director;
const Actors = Models.Actor;

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

// Route calls
app.use(express.static('public'));

// GET REQUESTS 

app.get('/', (req, res) => {
    res.send('Hello there! Welcome to my movie API!');
});

//Get all movies (updated)
app.get('/movies', (req, res) => {
    Movies.find()
        // .populate('Director') //Why isn't this working?
        .then((movies) =>{
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get one movie by title (updated)
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get all users (updated)
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

// Get a user by username (updated)
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get one director by name (updated)
app.get('/director/:Name', (req, res) =>{
    Directors.findOne({ Name: req.params.Name})
    .then((director) => {
        res.json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Get all movies within a genre (updated)
app.get('/movies/:Genre', (req, res) => {
    Movies.find({Genre: req.params.Genre})
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get info about a genre by name (Updated)
app.get('/genre/:Name', (req, res) => {
    Genres.findOne({Name: req.params.Name})
    .then((genre) => {
        res.status(201).json(genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// POST REQUESTS 

//Adds new movie to to main movie list (updated)
app.post('/movies', (req, res) =>{
    Movies.findOne({Title: req.body.Title})
    .then((movie) =>{
        if (movie) {
            return res.status(400).send(req.body.Title + ' already exists.');
        } else {
            Movies.create({
                Title: req.body.Title,
                Description: req.body.Description,
                Genre: req.body.Genre,
                Actors: req.body.Actors,
                ImagePath: req.body.ImagePath,
                Featured: req.body.Featured
            })
            .then((movie) => {res.status(201).json(movie)})
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
})
//Adds new user to userlist (updated)
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

//Delete a user by username (updated)
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + 'was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Delete a movie by its title (updated)
app.delete('/movies/:Title', (req, res) => {
    Movies.findOneAndRemove({ Title: req.params.Title})
    .then((movie) => {
        if (!movie) {
            res.status(400).send(req.params.Title + ' was not found.');
        } else {
            res.status(200).send(req.params.Title + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//PUT Requests

// Update the info of user by username (updated)
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, // This makes sure that the updated documents is returned
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// Add a movie to a user's list of favorites (updated)
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, {
        $addToSet: { FavoriteMovies: req.params.MovieID }
    },
    { new: true},
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errors: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// Remove a movie from a user's list of favorites (updated)
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true},
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Errors: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
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

