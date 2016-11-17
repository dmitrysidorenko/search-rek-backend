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
var port = process.env.PORT || 8888; // set our port

app.use(cors());

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

  /**
   * @type {{
   * tabId: number
   * favIconUrl: string
   * title: string
   * tabUrl: string
   * updated: number
   * openerTabId: number|null,
   * activeTabIds: string
   * }}
   */
  var h = req.body;

  h.timestamp = Firebase.database.ServerValue.TIMESTAMP;
  historyRawRef.push(h);
  processHistoryRaw(h, treeRawRef, function (err, result) {
    if (!err) {
      res.json({ message: 'Success', data: result });
    }
    else {
      res.status(500).send({ error: err ? err.message || '' : '' })
    }
  });
});

router.post('/tree/:id/move/:new_parent_id', function (req, res) {
  var id = req.params.id;
  var new_parent_id = req.params.new_parent_id;
  console.log('Move node ' + id + ' under node ' + new_parent_id);
  if (id && new_parent_id) {
    treeRawRef.child(id).update({
      parentId: new_parent_id
    });
    res.json({ message: 'Success' });
  } else {
    res.status(400).send({ error: 'Missed parameters' });
  }
});
router.delete('/tree/:id', function (req, res) {
  var id = req.params.id;
  if (id) {
    removeTreeItemsRecursively(id, function (e) {
      if (!e) {
        res.json({ message: 'Success' });
      } else {
        res.status(500).send({ error: 'Error occurred during recursive remove' })
      }
    });
  } else {
    res.status(400).send({ error: 'Invalid ID' });
  }
});
router.delete('/tree/:id/cut', function (req, res) {
  var id = req.params.id;
  if (id) {
    treeRawRef.child(id)
      .once('value', function (s) {
        var data = s.val();
        var parentId = data.parentId;
        console.log();
        treeRawRef.child(id).remove(function (e) {
          if (!e) {
            res.json({ message: 'Success' })
          } else {
            res.status(500).send({ error: 'Cannot remove node ' + id })
          }
        });
        treeRawRef.orderByChild('parentId')
          .equalTo(id)
          .once('value', function (s) {
            s.forEach(function (d) {
              console.log('======== CUT', d.key);
              treeRawRef.child(d.key).update({ parentId: parentId });
            })
          })
      });

  } else {
    res.status(400).send({ error: 'Invalid ID' });
  }
});

function removeTreeItemsRecursively(key, cb) {
  treeRawRef.child(key)
    .remove(function (e) {
      cb(e);
    });
  treeRawRef.orderByChild('parentId')
    .equalTo(key)
    .once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        removeTreeItemsRecursively(childKey, function () {})
      });
    })
}

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
