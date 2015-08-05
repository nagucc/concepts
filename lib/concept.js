
/*
Concept类的特征
1. 默认标签为：Concept
2. 都有一个唯一标识：id
*/


var cypher = require('./cypher-utils');

function Concept(id, db) {
	this.id = id;
	this.db = db;
};

/*
 为Concept添加rdfs:Label描述。
 参数
 	- label string或object， rdfs:Label的属性值。当label是object时，必须有一个value属性用于表示label的值。
 	- cb 回调函数 function(err, result)
*/
Concept.prototype.addRdfsLabel = function (label, cb) {

	// 当给定的label参数是string时，将其包装成object。
	if(typeof label === 'string') label = { value: label};
	var self = this;

	// 组合查询语句
	var query = [];
	query.push(cypher.match('c', 'Concept'),
		cypher.idFilter('c', self.id),
		cypher.merge('l', 'xsdString', cypher.toJson(label)),
		cypher.createConnect('c','l',relationship('r', 'rdfsLabel'), 'forward')
	);

	// 执行查询语句
	self.db.cypher({
		query: query.join('\n')
	}, cb);
};

/*
 获取Concept的所有rdfs:Label描述的值
 	- q 可选。rdfs:Label谓词的查询条件
 	- cb 回调函数function(err, concepts)
*/
Concept.prototype.rdfsLabels = function (q, cb) {
	var q, cb;
	q = arguments.length > 1 ? arguments[0]:null;
	cb = arguments[arguments.length -1];
	
	var query = [];
	query.push(cypher.matchConnect())
}

Concept.prototype.names = function (callback) {
	
	var self = this;
	var query = [];
	query.push(cypher.matchConnect(
		cypher.node('p','Concept'), 
		cypher.node('n', 'Name'), 
		cypher.relationship('','hasName'),
		'forward'));
	query.push(cypher.idFilter('p', self.id));
	query.push(cypher.ret('n'));
	// var query = 'Match (p:Concept)-[:hasName]->(n:Name)';
	// query += '\nWhere id(p) = {id}';
	// query += '\nReturn n';

	this.db.cypher({ query:query.join('\n') }, function (err, result) {
		if(err) callback(err);
		else {
			var names = [];
			result.forEach(function (res) {
				names.push(res.n.properties.text);
			});
			callback(err, names);
		}
	});
};

Concept.prototype.addName = function (name, callback) {
	var query = 'Match (p:Concept)';
	query += '\nWhere id(p) = {id}';
	query += '\nMerge (n:Name{text:{name}})';
	query += '\nCreate (p)-[:hasName]->(n)';
	this.db.cypher({
		query: query,
		params: {id: this.id, name: name}
	}, callback);
};

Concept.prototype.removeName = function (name, cb) {
	var query = 'Match (p:Concept)-[r:hasName]->(n:Name{text:{name}})';
	query += '\nWhere id(p) = {id}';
	query += '\nDelete r';
	this.db.cypher({
		query: query,
		params: {id: this.id, name: name}
	}, cb);
};

Concept.prototype.descriptions = function (cb) {
	var query = 'Match (p:Concept)-[:hasDescription]->(d:Description)';
	query += '\nWhere id(p) = {id}';
	query += '\nReturn d';

	this.db.cypher({
		query:query,
		params: {id:this.id}
	}, function (err, result) {
		if(err) cb(err);
		else {
			var descs = [];
			result.forEach(function (res) {
				descs.push(res.d.properties.text);
			});
			cb(err, descs);
		}
	});
};

Concept.prototype.addDesc = function (desc, cb) {
	var query = 'Match (p:Concept)';
	query += '\nWhere id(p) = {id}';
	query += '\nMerge (d:Description{text:{desc}})';
	query += '\nCreate (p)-[:hasDescription]->(d)';
	this.db.cypher({
		query: query,
		params: {id: this.id, desc: desc}
	}, cb);
};

Concept.prototype.removeDesc = function (desc, cb) {
	var query = 'Match (p:Concept)-[r:hasDescription]->(d:Description{text:{desc}})';
	query += '\nWhere id(p) = {id}';
	query += '\nDelete r';
	this.db.cypher({
		query: query,
		params: {id: this.id, desc: desc}
	}, cb);
};


module.exports = Concept;