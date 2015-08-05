var Person = require('./lib/person');
var url = 'http://neo4j.ynu.edu.cn';
var na = new Person(null, url);

na.create('na57', 'na57 person', function (err, result) {
	console.log('done');
});

var ex = new Person(21, url);
ex.delete(function () {
	console.log('deleted');
});