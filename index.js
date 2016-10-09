var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var cors = require('cors');
var processHistoryRaw = require('./processHistoryRaw');

var Firebase = require("firebase");
var config = {
  apiKey: "AIzaSyC5N0FavZVS3L-FWaBXnLtuKgC0qJ9CDUE",
  authDomain: "searchtrek.firebaseapp.com",
  databaseURL: "https://searchtrek.firebaseio.com",
  storageBucket: "searchtrek.appspot.com",
  messagingSenderId: "612488784459"
};
var myFirebaseRef = Firebase.initializeApp(config);
var historyRawRef = myFirebaseRef.database().ref('history-raw');
var treeRawRef = myFirebaseRef.database().ref('tree');

app.use(cors());

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  console.log('Something is happening.');
  next();
});

// test route to make sure everything is working (accessed at GET
// http://localhost:8080/api)
router.get('/', function (req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/log', function (req, res) {
  console.log('/log body', req.body);
  var h = req.body;
  historyRawRef.push(h);
  processHistoryRaw(h, treeRawRef);
  res.json({ message: 'Success' });
});

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
