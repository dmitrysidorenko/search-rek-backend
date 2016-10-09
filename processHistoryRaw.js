var getLinkPreview = require('./getLinkPreview');

function snapshotToArray(snapshot) {
  var arr = [];
  snapshot.forEach(function (row) {
    var d = row.val();
    arr.push({
      key: row.key,
      data: d
    });
  });
  return arr;
}

function convertHistoryItemToTreeItem(item) {
  return {
    title: item.title,
    tabId: item.tabId,
    openerTabId: item.openerTabId,
    favIconUrl: item.favIconUrl,
    pageUrl: item.tabUrl
  };
}

module.exports = function (historyItem, treeRef) {
  var data = convertHistoryItemToTreeItem(historyItem);
  if (data) {
    if (historyItem.openerTabId) {
      getLinkPreview(data.pageUrl, function (err, result) {
        console.log('Preview of ' + data.pageUrl, err, result);
        if (!err) {
          data.linkPreview = result;
          console.log('Link Preview is ready');
        }
        var tabId = historyItem.openerTabId;
        treeRef.orderByChild('tabId')
          .startAt(tabId).endAt(tabId)
          .limitToLast(1)
          .once('value', function (s) {
            var all = snapshotToArray(s);
            if (all.length === 0) {
              //there is no parent item in DB
              data.parentId = null;
              treeRef.push(data);
            } else {
              var parentKey = all[all.length - 1].key;
              data.parentId = parentKey;
              treeRef.push(data);
            }
          })
      });
    }
  }
};
