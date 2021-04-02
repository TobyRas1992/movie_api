const jwtSecret = 'your_jwt_secret'; // Key used in JWTStrategy

const jwt = require('jsonwebtoken'),
passport = require('passport');

require('./passport'); // My local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //encodes username in JWT
        expiresIn: '7d', //specifies token expiration
        algorithm: 'HS256' //specifies algorithm used to encode the values of the JWT
    });
};


// creates new endpoint for registered users to log in. 
// authenticates login requests with basic HTTP authentication and generates a JWT token. 
// this code first uses LocalStrategy from passport.js to check that username and password in the request body exist in the database. If they do, you use the generateJWTToken(); function to create a JWT based on the username and password, which you then send back as a response to the client. If the username and password don’t exist, you return the error message you receive fromLocalStrategy back to the client.
/* Post login */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token }); //ES6 shorthand for return res.json({user: user, token: token})
            });
        })(req, res);
    });
}