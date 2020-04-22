'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// bring in firestore
const Firestore = require("@google-cloud/firestore");

// configure with current project
const firestore = new Firestore(
    {
        projectId: process.env.GOOGLE_CLOUD_PROJECT
    }
);

// create the server
const app = express();

// the backend server will parse json, not a form request
app.use(bodyParser.json());

// mock events data - for a real solution this data should be coming 
// from a cloud data store
const mockEvents = {
    events: [
        { title: 'an event', id: 1, description: 'something really cool', location: 'Joes pizza', likes: 0 },
        { title: 'another event', id: 2, description: 'something even cooler', location: 'Johns pizza', likes: 0 }
    ]
};




// health endpoint - returns an empty array
app.get('/', (req, res) => {
    res.json([]);
});

// version endpoint to provide easy convient method to demonstrating tests pass/fail
app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});

app.get('/items',function(req,res)
{
    //res.send('Home Page!');
// Create a new client
    const firestore = new Firestore();
    const document = firestore.collection('Items').get()
        .then((snapshot) => {
            if (!snapshot.empty) {
                const ret = {items: []};
                snapshot.docs.forEach(element => {
                    //get data
                    const item = element.data();
                    //console.log(item);
                    ret.items.push(item);
                }, this);
                //console.log(ret.items);
                res.json(ret);
            }
        });
});

// responsible for retrieving events from firestore and adding 
// firestore's generated id to the returned object
function getItems(req, res) {
    firestore.collection("Items").get()
        .then((snapshot) => {
            if (!snapshot.empty) {
                const ret = { events: [] };
                snapshot.docs.forEach(element => {
                    //get data
                    const el = element.data();
                    ret.events.push(el);
                }, this);
                console.log(ret);
                res.json(ret);
            } else {
                // if no data has yet been added to firestore, return mock data
                res.json(mockEvents);
            }
        })
        .catch((err) => {
            console.error('Error getting items', err);
            res.json(mockEvents);
        });
};



// this has been modifed to call the shared getItems method that
// returns data from firestore
// app.get('/items', (req, res) => {
//     getItems(req, res);
// });

// This has been modified to insert into firestore, and then call 
// the shared getItems method.
app.post('/addItem', (req, res) => {
    // create a new object from the json data. The id property
    // has been removed because it is no longer required.
    // Firestore generates its own unique ids
    const ev = {
        itemName: req.body.itemName,
        itemType: req.body.itemType,
        itemNumber: req.body.itemNumber,
        storeCode: req.body.storeCode,
        quantity: req.body.quantity,
        store: req.body.store,
        likes: 0
    }
    firestore.collection("Items").add(ev).then(ret => {
        // return events using shared method that adds __id
        //getItems(req, res);
    });
});


// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
function changeLikes(req, res, id, increment) {
    // return the existing objct
    firestore.collection("Items").doc(id).get()
        .then((snapshot) => {
            const el = snapshot.data();
            // if you have elements in firestore with no likes property
            if (!el.likes) {
                el.likes = 0;
            }
            // increment the likes
            if (increment) {
                el.likes++;
            }
            else {
                el.likes--;
            }
            // do the update
            firestore.collection("Items")
                .doc(id).update(el).then((ret) => {
                    // return events using shared method that adds __id
                    getItems(req, res);
                });
        })
        .catch(err => { console.log(err) });
}

// put because this is an update. Passes through to shared method.
app.put('/items/like', (req, res) => {
    changeLikes(req, res, req.body.id, true);
});

// Passes through to shared method.
// Delete distinguishes this route from put above
app.delete('/items/like', (req, res) => {
    changeLikes(req, res, req.body.id, false);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const PORT = 8086;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;