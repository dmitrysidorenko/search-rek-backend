var getSession = require('./neo4j/session');

var neo4j = require('neo4j-driver').v1;
/**
 * @typedef {{
   * tabId: number
   * favIconUrl: string
   * title: string
   * tabUrl: string
   * updated: number
   * openerTabId: number|null,
   * activeTabIds: string
   * }} LogObject
 */


module.exports = {
  /**
   * @param {LogObject} obj
   */
  log: function (obj) {
    var session = getSession();
    console.log('Session created');

    var json = {
      timestamp: Date.now(),
      faviconUrl: obj.favIconUrl,
      tabId: obj.tabId,
      url: obj.tabUrl,
      openerTabId: obj.openerTabId,
      title: obj.title
    };
    var jsonStr = JSON.stringify(json, null, 2);
    console.log('Going to save ' + jsonStr);

    var queryObjStr = Object.keys(json)
      .reduce(function (acc, cur, i) {
        if (i > 0) {
          acc += ',';
        }
        acc += cur + ': {' + cur + '}';
        return acc;
      }, '');

    var query = "CREATE (a:Link {" + queryObjStr + "})";
    console.log('Query: ' + query);

    return session
      .run(query, json)
      .then(function (result) {
        console.log('Result:', result);
        //console.log(result.records[0].get("title") + " " +
        // result.records[0].get("name"));
        session.close();
        driver.close();
      }, function (error) {
        console.log('Error:', error.message);
        console.log(error);
        throw error;
      });
  }
};
