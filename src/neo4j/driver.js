var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://search-trek-neo4j", neo4j.auth.basic("neo4j", "123"));
console.log('Neo4j driver created');

module.exports = driver;
