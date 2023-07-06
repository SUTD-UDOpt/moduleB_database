const {readFile, readFileSync} = require('fs');
const cors = require('cors')
const spawner = require('child_process').spawn;
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
const { Pool } = require('pg');
require('dotenv').config();


// Create a new pool
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.DB_NAME,
    password: process.env.PASSWORD,
    port: process.env.PORT
  });

var stash = []

//for testing/ single user password just store here can already
const users = [
    {
        "username": "admin",
        "password": "adminpw"
    },
    {
        "username": "user",
        "password": "userpw"
    }
]

function getUserbyUsername(username){
    return users.find(user => user.username === username)
}

// start express server at localhost 3000
const app = express();
app.set('view-engine', 'ejs');
app.listen(3000, () => console.log('http://localhost:3000'));
app.use(cors({origin:'http://localhost:3000', credentials : true}));

// import libraries
app.use('/static', express.static('./static'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set up flash and sessions
app.use(flash())

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUinitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//initialise passport
const initializePassport = require('./static/controllers/passport-config');
initializePassport(
    passport,
    getUserbyUsername
);

//check if ont authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/home');
    }
    next();
  }

//default login page
app.get('/', checkNotAuthenticated, async (request, response) => {
    response.render("login.ejs")
})

app.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureFlash: true
}))


//check authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

// server immidiately 'gets' home.html and send it to client browser.
app.get('/home', checkAuthenticated, (request, response) => {
    readFile('./index.html','utf8', (err,html) => {
        response.send(html)
    })
});


// get boundary road cat.
app.post('/api_roadCat', (request,response) => {
    try{
        const python_process = spawner('python',['static/py/GetBoundaryRoadType.py', JSON.stringify(request.body)]);
        var newsItems = '';
        python_process.stdout.on("data", function (data) {
            newsItems += data.toString();
        });

        python_process.stdout.on("end", function () {
            if (newsItems.includes("failed")){
                console.error(`Not possible to build...`);
                response.json({data:0});
            } else {
                try {
                    console.log(newsItems);
                    response.json(newsItems);
                } catch(error){
                    console.log(error)
                    // console.error(`Unexpected end of json input...`);
                    response.json({data:1});
                }
            }
        });
    } catch(error) {
        console.error(`Something is very wrong...`);
    }
});

app.get('/api_getProgress', (request, response) => {
    console.log("in prog" + stash.length)
    if (stash.length > 0){
        var data = stash.pop()
        stash = []
        response.json({data:data})
    } else {
        response.json({data:0})
    }
})

// do something when a call to '/api_python' comes from client side.
app.post('/api_python', (request,response) => {
    try{
        const python_process = spawner('python',['static/py/Optimise.py', JSON.stringify(request.body)]);
        var newsItems = '';
        python_process.stdout.on("data", function (data) {
            newsItems += data.toString();
            newsItems = newsItems.replace(/^\s+|\s+$/g, '')
            console.log(newsItems + '*')
            console.log("slicer: " + newsItems.slice(newsItems.length - 3))
            if (newsItems.slice(newsItems.length - 2) == "}}"){
                try {
                    var jsonParse = JSON.parse(newsItems);
                    stash.push(jsonParse)
                    newsItems = ""
                } catch(error){
                    console.log(error)
                }
            }
            console.log(stash.length);
        });

        python_process.stdout.on("end", function () {
            console.log("fin at " + stash.length)
            if (stash.length > 0){
                var data = stash.pop()
                response.json({data:data})
            } else {
                response.json({data:1})
            }
            stash = []
        })
    } catch(error) {
        console.error(`Something is very wrong...`);
    }
});

//for database
app.post('/get-data', async (req, res) => {
    const sessionId = req.body.sessionId;
    console.log("Received sessionId: ", sessionId);
    // Connect to your database and execute the query
    pool.query('SELECT * FROM temporarydata.module_bb_data WHERE "Session_ID" = $1;', [sessionId], (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while querying the database in index.js!!" });
        return;
      }
      console.log(results);
      res.status(200).json(results.rows);
    });
  });