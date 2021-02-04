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
}


// I need Ali to explain this function to me step by step.
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