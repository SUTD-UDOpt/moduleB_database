const {readFile, readFileSync} = require('fs');
const cors = require('cors')
const spawner = require('child_process').spawn;
const express = require('express');
var stash = []

// start express server at localhost 3000
const app = express();
app.listen(3000, () => console.log('http://localhost:3000'))
app.use(cors({origin:'http://localhost:3000', credentials : true}));

// import libraries
app.use('/static', express.static('./static'))
app.use(express.json());

// server immidiately 'gets' home.html and send it to client browser.
app.get('/', (request, response) => {
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