 'use strict';

console.log(`process.env.SERVER = ${process.env.SERVER}`);
// get the environment variable, but default to localhost:8082 if its not set
const SERVER = (process.env.SERVER ? process.env.SERVER : "http://localhost:8082")

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');
const path = require('path');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');
// var formidable = require('formidable');

// request is used to make REST calls to the backend microservice
// details here: https://www.npmjs.com/package/request
var request = require('request');

// create the server
const app = express();
app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'jade');

// set up the parser to get the contents of data from html forms 
// this would be used in a POST to the server as follows:
// app.post('/route', urlencodedParser, (req, res) => {}
const urlencodedParser = bodyParser.urlencoded({ extended: false });


// defines a route that receives the request to /
app.get('/product', (req, res) => {
    // make a request to the backend microservice using the request package
    // the URL for the backend service should be set in configuration
    // using an environment variable. Here, the variable is passed
    // to npm start inside package.json:
    //  "start": "SERVER=http://localhost:8082 node server.js",
    request.get(  // first argument: url + return format
        {
            url: SERVER + '/items',  // the microservice end point for events
            json: true  // response from server will be json format
        }, // second argument: function with three args,
        // runs when server response received
        // body hold the return from the server
        (error, response, body) => {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                // res.render('error_message',
                //     {
                //         layout: 'default',  //the outer html page
                //         error: error // pass the data from the server to the template
                //     });
            }
            else {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log(body); // print the return from the server microservice

                res.render('product',
                    {items: body.items}
                    ); // pass the data from the server to the template
            }
        });
});

app.get('/', (req, res) => {
    // make a request to the backend microservice using the request package
    // the URL for the backend service should be set in configuration
    // using an environment variable. Here, the variable is passed
    // to npm start inside package.json:
    //  "start": "SERVER=http://localhost:8082 node server.js",
    request.get(  // first argument: url + return format
        {
            url: SERVER + '/items',  // the microservice end point for events
            json: true  // response from server will be json format
        }, // second argument: function with three args,
        // runs when server response received
        // body hold the return from the server
        (error, response, body) => {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                // res.render('error_message',
                //     {
                //         layout: 'default',  //the outer html page
                //         error: error // pass the data from the server to the template
                //     });
            }
            else {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log(body); // print the return from the server microservice

                res.render('index',
                    {items: body.items}
                ); // pass the data from the server to the template
            }
        });
});

// app.get('/test', (req, res) => {
//     res.sendFile( 'index.html');
// });
app.get('/login', (req, resp) => {
    resp.sendFile( __dirname + '/views/login.html');
});
app.get('/index_with_login', (req, res) => {
    res.sendFile( __dirname + '/views/index_with_login.html');
});
app.get('/addItem', (req, res) => {
    // make a request to the backend microservice using the request package
    // the URL for the backend service should be set in configuration
    // using an environment variable. Here, the variable is passed
    // to npm start inside package.json:
    //  "start": "SERVER=http://localhost:8082 node server.js",
    request.get(  // first argument: url + return format
        {
            url: SERVER + '/items',  // the microservice end point for events
            json: true  // response from server will be json format
        }, // second argument: function with three args,
        // runs when server response received
        // body hold the return from the server
        (error, response, body) => {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                // res.render('error_message',
                //     {
                //         layout: 'default',  //the outer html page
                //         error: error // pass the data from the server to the template
                //     });
            }
            else {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

                res.render('addItems'); // pass the data from the server to the template
            }
        });
});

// defines a route that receives the post request to /event
app.post('/addItem',
      urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "SERVER=http://localhost:8082 node server.js",
        // var form = new formidable.IncomingForm();

        // form.parse(req, function (err, fields, files){
        //     var oldpath = files.fileToUpload.path;
        //     var newpath = __dirname + + '/uploads/' + files.fileToUpload.name;
        //     fs.rename(oldpath, newpath, function (err){
        //         if (err) throw err;
        //         res.write('File uploaded and moved!');
        //         console.log(fields.name);
        //         console.log("Request Body " + req.body.itemName.toString());
        //     })
        // })
        //         console.log("Inside App Post")
        //         var form = new formidable.IncomingForm();
        //         form.parse(req);
        //         form.on('fileBegin', function (name, file){
        //             file.name = 'test'+ '.jpg';
        //             file.path = __dirname + '/uploads/' + file.name;
        //         });
        //         form.on('file', function (name, file){
        //             console.log('Uploaded ' + file.name);
        //         });
        // form.on('fileBegin', function (name, file){
        //     file.path = __dirname + '/uploads/' + name;
        // });
        //
        // form.on('file', function (name, file){
        //     console.log('Uploaded ' + name);
        // });
        console.log(req.body);
        request.post(  // first argument: url + data + formats
            {
                url: SERVER + '/addItem',  // the microservice end point for adding an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from server will be json format
            },
             // () => {
             //    res.render('addItems',
             //         {items: body.items}
             //    )},
            ()=> {
                res.redirect("/");
            }  // redirect to the home page on successful response
        );

        console.log(req);
    });

app.post('/contact',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration
        // using an environment variable. Here, the variable is passed
        // to npm start inside package.json:
        //  "start": "SERVER=http://localhost:8082 node server.js",
        request.post(  // first argument: url + data + formats
            {
                url: SERVER + '/contact',  // the microservice end point for adding an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from server will be json format
            },
            ()=> {
                res.redirect("/contact");
            }  // redirect to the home page on successful response
        );
        console.log(req);
    });


// defines a route that receives the post request to /event/like to like the event
app.post('/item/like',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        // changed to a put now that real data is being updated
        request.put(  // first argument: url + data + formats
            {
                url: SERVER + '/item/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {  
                res.redirect("/"); // redirect to the home page on successful response
            });

    });


// defines a route that receives the delete request to /event/like to unlike the event
app.post('/item/unlike',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        request.delete(  // first argument: url + data + formats
            {
                url: SERVER + '/item/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {  
                res.redirect("/"); // redirect to the home page on successful response
            });

    });

// generic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// specify the port and start listening
const PORT = 8080;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;