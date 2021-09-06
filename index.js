const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    cors = require('cors');
const { check, validationResult } = require('express-validator');

const app = express();

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'http://localhost:4200', 'https://myflix-tobias-cf.netlify.app']; // specifies allowed websites for CORS.


app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = "The CORS policy for this application does not allow access from this origin " + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

// Requires models defined in models.js
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// Server connection
// mongoose.connect("mongodb://localhost:27017/myFlixDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//Middleware 
app.use(morgan('common')); // Logs IP addr, time, method, status code
app.use(bodyParser.json()); // read req.body of HTTP requests
let auth = require('./auth')(app); //Handles HTTP authentication + JWT -> (app) ensures that Express is available in the file as well. 

const passport = require('passport');
require('./passport'); //why set it up like this?

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
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// One movie - get by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get("/movies/genres/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then(movie => {
            res.json(movie.Genre);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

// Director info - get from name
app.get('movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// All users - get
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
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

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.post('/movies', passport.authenticate('jwt', { session: false }), [check('Title', 'Title is required.').not().isEmpty(), check('Description', 'Description is required').not().isEmpty(), check('Actors', 'Actors need to be in an array.').isArray(), check('ImagePath', 'Correct image path required').isLength({ min: 5 }), check('Featured', 'Boolean value required.').isBoolean(), check('Released', 'Release year required').isLength({ min: 4 })], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    Movies.findOne({ Title: req.body.Title })
        .then((movie) => {
            if (movie) {
                return res.status(400).send(req.body.Title + ' already exists.');
            } else {
                Movies.create({
                    Title: req.body.Title,
                    Description: req.body.Description,
                    Genre: req.body.Genre,
                    Director: req.body.Director,
                    Actors: req.body.Actors,
                    ImagePath: req.body.ImagePath,
                    Featured: req.body.Featured,
                    Released: req.body.Released
                })
                    .then((movie) => { res.status(201).json(movie) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
})
//Adds new user to userlist
app.post('/users',
    [check('Username', 'Username is required').isLength({ min: 5 }), //minimum value of 5 characters are only allowed
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(), // chaining .not().isEmpty() simply means "it is not allowed to be empty"
    check('Email', 'Email does not appear to be valid').isEmail()], (req, res) => {

        // check the validation object for errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username }).then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }).then((user) => { res.status(201).json(user) })
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
app.delete('/users/:Username', passport.authenticate("jwt", { session: false }), passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
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
app.delete('/users/byId/:_id', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndRemove({ _id: req.params._id })
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
//
// Delete a movie by its title
app.delete('/movies/:Title', passport.authenticate("jwt", { session: false }), (req, res) => {
    Movies.findOneAndRemove({ Title: req.params.Title })
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

// Update user, by username
app.put('/users/:Username', passport.authenticate("jwt", { session: false }), [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
        "Username",
        "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required")
        .not()
        .isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }, // This makes sure that the updated documents is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/:MovieID', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $addToSet: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
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
app.delete('/users/:Username/:MovieID', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

