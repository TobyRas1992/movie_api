const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid= require('uuid'),
mongoose = require('mongoose');
const { zip } = require('lodash');
const passport = require('passport');
require('./passport'); //why set it up like this?

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
let auth = require('./auth')(app); //Handles HTTP authentication + JWT -> (app) ensures that Express is available in the file as well. 

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Route calls
app.use(express.static('public'));


// QUERIES

// Default text response
app.get('/', (req, res) => {
    res.send('Hello there! Welcome to my movie API!');
});

// ALL Movies - get
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) =>{
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// One movie - get by title
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

// Genre info - get from title of movie
app.get("/movies/genres/:Title", (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then(movie => {
            res.json(movie.Genre);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

// All movies within a genre
app.get('/movies/:Genre', (req, res) => {
    Movies.find({"Genre.Name": req.params.Genre})
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Genre info - get by name
app.get('movies/genre/:Name', (req, res) => {
    Movies.findOne({"Genre.Name": req.params.Name})
    .then((genre) => {
        res.status(201).json(genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


// Director info - get from name
app.get('movies/director/:Name', (req, res) =>{
    Movies.findOne({ "Director.Name": req.params.Name})
    .then((director) => {
        res.json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// All users - get
app.get('/users', (req, res) => {
    Users.find()
        .populate('FavoriteMovies')
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
//Adds new user to userlist
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

//Delete a user by username
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

//Delete a user by id
app.delete('/users/:_id', (req, res) => {
    Users.findOneAndRemove({ _id: req.params._id})
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

// Delete a movie by its title
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

// Update the info of user by username
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

// Add a movie to a user's list of favorites
app.post('/users/:Username/:MovieID', (req, res) => {
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

// Remove a movie from a user's list of favorites
app.delete('/users/:Username/:MovieID', (req, res) => {
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



// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

