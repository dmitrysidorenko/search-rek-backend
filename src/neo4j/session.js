var driver = require('./driver');

function createSession() {
  return driver.session();
}

module.exports = createSession;
