'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// bring in firestore
const Firestore = require("@google-cloud/firestore");

const Cloud = require('@google-cloud/storage')
const { Storage } = Cloud

const bucketName = 'webportal-frontend-item-bucket';


// const multerMid = multer({
//     storage: multer.memoryStorage(),
//     limits: {
//         fileSize: 5 * 1024 * 1024,
//     },
// })
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
// app.use(bodyParser.urlencoded({extended: true}))

// app.use(multerMid.single('file'));
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

async function uploadImage(filename) {
    // Uploads a local file to the bucket
    console.log('Inside Upload Image Method');
     const storage = new Storage();
    await storage.bucket(bucketName).upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: 'public, max-age=31536000',
        }
    });
    console.log(`${filename} uploaded to ${bucketName}.`)

    // console.log(fileObj);
    // const bucket = storage.bucket(GCLOUD_BUCKET);
    // const file = bucket.file(fileObj);
    // const stream = file.createWriteStream({
    //     metadata: {
    //         contentType: fileObj.mimetype
    //     }
    // });
    //
    // stream.on('error', err => {
    //     console.log("Error streaming")
    // });
    //
    // stream.on('finish', () => {
    //     console.log("Write finished");
    // });
    // stream.end(fileObj.buffer);
    //
    // console.log(`${filename} uploaded to ${bucket}.`);
}

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

    //uploadImage("/Users/angup2/Documents/myLearning/GCP-Course/git-repo/open-source-pundits/pundit-app/frontend/uploads/fileToUpload");
    //console.log((req.body.fileToUpload));
    console.log(req.body);
    const ev = {
        itemName: req.body.itemName,
        itemType: req.body.itemType,
        itemNumber: req.body.itemNumber,
        storeCode: req.body.storeCode,
        quantity: req.body.quantity,
        store: req.body.store,
        price: req.body.price,
        discount: req.body.discount,
        likes: 0
    }
    console.log(req.body);
    firestore.collection("Items").add(ev).then(ret => {
        // return events using shared method that adds __id
        //getItems(req, res);
        getItems(req, res);
    });
    console.log("Added Document to Firestore");
});

app.post('/contact', (req, res) => {
    // create a new object from the json data. The id property
    // has been removed because it is no longer required.
    // Firestore generates its own unique ids
    const ev = {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
    };
    const data = JSON.stringify(ev);
    const topicName = 'webportal-frontend-topic';
    // [START pubsub_publish]
    // [START pubsub_quickstart_publisher]
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
        // const topicName = 'YOUR_TOPIC_NAME';
        // const data = JSON.stringify({foo: 'bar'});

        // Imports the Google Cloud client library
    const {PubSub} = require('@google-cloud/pubsub');

    // Creates a client; cache this for further use
    const pubSubClient = new PubSub();

    async function publishMessage() {
        /**
         * TODO(developer): Uncomment the following lines to run the sample.
         */
            // const topicName = 'my-topic';

            // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
        const dataBuffer = Buffer.from(data);

        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published.`);
    }

    publishMessage().catch(console.error);
    // [END pubsub_publish]
    // [END pubsub_quickstart_publisher]
    console.log(ev);
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

const PORT = 8080;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;