var cypher = require('./cypher-utils');
var Concept = require('./concept');

function ConceptManager(db) {
	this.db = db;
};


/*
创建Concept节点
参数
	- cb 回调函数function(err, Concept)
*/
ConceptManager.prototype.create = function (cb) {

	var self = this;

	// 组合查询语句
	var query = [];
	query.push(cypher.create('p', 'Concept'));
	query.push(cypher.ret('p'));


	// 执行查询
	this.db.cypher({
		query: query.join('\n')
	}, function (err, result) {
		if (err) cb(err);
		else cb(null, new Concept(result[0].p._id, self.db));
	});
};

/*
删除Concept节点
参数
	- id 指定删除的节点的id
	- cb 回调函数function(err, result)
*/
ConceptManager.prototype.del = function (id, cb) {

	var self = this;
	var query = [];
	query.push(cypher.match('p', 'Person'));
	query.push(cypher.idFilter('p', id));
	query.push(cypher.matchConnect('p','','r'));
	query.push(cypher.del('r'));
	query.push(cypher.del('p'));

	this.db.cypher({
		query: query.join('\n')
	}, cb);
};

ConceptManager.prototype.get = function (id, cb) {
	var db = this.db;
	var query = [];
	query.push(cypher.match('p', 'Concept'));
	query.push(cypher.idFilter('p', id));
	query.push(cypher.ret('p'));
	this.db.cypher({
		query: query.join('\n')
	}, function (err, result) {
		if(err) cb(err);
		else {
			var concept = new Concept(result[0].p._id, db);
			cb(err, concept);
		}
	});
};

ConceptManager.prototype.findByName = function (name, cb) {
	var db = this.db;
	var query = [];
	query.push('Match (p:Concept)-[:hasName]->(n:Name{text:{name}})');
	query.push(cypher.ret('p'));
	this.db.cypher({
		query: query.join('\n'),
		params: {name: name}
	}, function (err, result) {
		if(err) cb(err);
		else {
			var persons = [];
			result.forEach(function (res) {
				var person = new Concept(res.p._id, db);
				persons.push(person);
			});
			cb(err, persons);
		}
	});
};



module.exports = ConceptManager;