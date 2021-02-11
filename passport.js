const passport = require('passport');
require('./passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');


let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

//Basic HTTP authentication for login requests
passport.use(
    new LocalStrategy (
        {
            usernameField: 'Username',
            passwordField: 'Password'
        }, 
        (username, password, callback) => {
            console.log(username + ' ' + password);
            Users.findOne({ Username: username }, (error, user) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
                if (!user) {
                    console.log('Incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect username or password.'}
                        );
                }
                if (!user.validatePassword(password)) {
                    console.log('incorrect password');
                    return callback(null, false, {message: 'Incorrect password.'});
                }
                console.log('finished');
                return callback(null, user);
            });
        }
    )
);

// Authenticates users based on JWT strategy
passport.use(new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret'
    }, 
    (jwtPayload, callback) => {
        return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback (error);
        });
    }
    )
);