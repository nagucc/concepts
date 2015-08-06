var cypher = require('./cypher-utils');
var Concept = require('./concept');
var neo = require('neo4j');

function ConceptManager(url) {
	this.url = url;
	this.db = new neo.GraphDatabase({url:url});
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
	query.push(cypher.create('p', 'Concept'));		// 创建节点
	query.push(cypher.ret('p'));					// 返回刚刚创建的节点
	


	// 执行查询
	this.db.cypher({
		query: query.join('\n')
	}, function (err, result) {
		if (err) cb(err);
		else cb(null, new Concept(self.url, result[0].p._id, result[0].p.labels, result[0].p.properties));
	});
};

/*
删除Concept节点
参数
	- id 指定删除的节点的id
	- cb 回调函数function(err, result)
*/
ConceptManager.prototype.del = function (id, cb) {

	var query = [];
	query.push(cypher.match('p', 'Concept'));		// 匹配Concept标签
	query.push(cypher.idFilter('p', id));			// 根据id进行筛选
	query.push(cypher.matchConnect('p','','r'));	// 找出当前节点相关的所有连接
	query.push(cypher.del('r'));					// 删除这些连接
	query.push(cypher.del('p'));					// 删除节点
	

	this.db.cypher({
		query: query.join('\n')
	}, cb);
};


/*
获取节点
参数：
	- id 节点id
	- cb 回调函数function(err, Concept)
*/
ConceptManager.prototype.get = function (id, cb) {
	var self = this;
	var query = [];
	query.push(cypher.match('p', 'Concept'));
	query.push(cypher.idFilter('p', id));
	query.push(cypher.ret('p'));
	self.db.cypher({
		query: query.join('\n')
	}, function (err, result) {
		if(err ||  result.length === 0) cb(err || 'could not find concept');
		else {
			var concept = new Concept(self.url, result[0].p._id,  result[0].p.labels, result[0].p.properties);
			cb(err, concept);
		}
	});
};


/*
根据节点name获取节点
*/
ConceptManager.prototype.findByName = function (name, cb) {
	var self = this;
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
				var person = new Concept(self.url, res.p._id, result[0].p.labels, result[0].p.properties);
				persons.push(person);
			});
			cb(err, persons);
		}
	});
};





module.exports = ConceptManager;