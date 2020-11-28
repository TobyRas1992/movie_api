const express = require('express'),
morgan = require('morgan');

const app = express();

let topMovies = [
    {
        title: 'Team America: World Police',
        director: 'Tray Parker'
    },
    {
        title: 'The Big Lebowski',
        director: 'Ethan Coen', 'Joel Coen'
    },
    {
        title: 'Anchorman: The Legend of Ron Burgundy',
        director: 'Adam McKay'
    }
];
app.use(morgan('common'));


app.use(express.static('public')); // maybe this can replace the get requests?

app.use((err, req, res, next) => { // error handling should be defined last in the chain of middleware. Hope this is okay. 
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to a database of my favorite movies!');
});

// app.get('/documentation', (req, res) => {                  
//     res.sendFile('public/documentation.html', { root: __dirname });
// });

app.get('/movies', (req, res) => {
    res.json(topMovies);
});


// listen for requests
app.listen(8080, () =>
    console.log('Your app is listening on port 8080.');
);
