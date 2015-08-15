var cypher = require('./cypher-utils');
var Concept = require('./concept');
var neo = require('neo4j');
var Class = require('js.class');


var ConceptManager = Class({
	
	/*
	构造函数
	*/
	create: function(url){
		this.url = url;
		if(url)
			this.db = new neo.GraphDatabase({url:url});
	},
	
	/*
	创建Concept节点
	参数
		- cb 回调函数function(err, Concept)
	*/
	addNew: function (cb) {
		var self = this;
		// 组合查询语句
		var query = [];
		query.push(cypher.create('p', Concept.LABEL));		// 创建节点
		query.push(cypher.ret('p'));					// 返回刚刚创建的节点
		
	
	
		// 执行查询
		self.db.cypher({
			query: query.join('\n')
		}, function (err, result) {
			if (err) cb(err);
			else {
				var c = new Concept(self.url, result[0].p._id);
				c.labels = result[0].p.labels;
				cb(null, c);
			}
		});
	},
	/*
	删除Concept节点
	参数
		- id Number | Concept 指定删除的节点的id或节点对象
		- cb 回调函数function(err, result)
	*/
	del: function (id, cb) {
		var self = this;
		if(id instanceof Concept) id = id.id;
		var query = [];
		query.push(cypher.match('p', Concept.LABEL));		// 匹配Concept标签
		query.push(cypher.idFilter('p', id));			// 根据id进行筛选
		query.push(cypher.matchConnect('p','','r'));	// 找出当前节点相关的所有连接
		query.push(cypher.del('r'));					// 删除这些连接
	
		self.db.cypher({										// 删除节点的连接
			query: query.join('\n')
		}, function (err) {
			if(err) cb(err);
			else {
				var q2 = [cypher.match('p'),
					cypher.idFilter('p', id),
					cypher.del('p')];
				self.db.cypher({query:q2.join('\n')}, cb);		// 删除节点
			}
		});
	},
	
	
	/*
	获取节点
	参数：
		- id 节点id
		- cb 回调函数function(err, Concept)
	*/
	get: function (id, cb) {
		var self = this;
		var query = [];
		query.push(cypher.match('p', Concept.LABEL));
		query.push(cypher.idFilter('p', id));
		query.push(cypher.ret('p'));
		self.db.cypher({
			query: query.join('\n')
		}, function (err, result) {
			if(err ||  result.length === 0) cb(err || 'could not find concept');
			else {
				var concept = new Concept(self.url, result[0].p._id);
				concept.labels = result[0].p.labels;
				concept.properties = result[0].p.properties;
				cb(err, concept);
			}
		});
	},
	
	/*
	根据节点name获取节点
	参数
		- name 必须的
		- maxLength 可选的
		- cb 必须的，回调函数
	*/
	findByName: function () {
		var name = arguments[0];
		var maxLength = 100;
		if(arguments.length > 2) maxLength = arguments[1];
		var cb = arguments[arguments.length - 1];
		var self = this;
		var query = [];
		query.push('Match (p:Concept)-[:hasName]->(n:Name{text:{name}})');
		query.push(cypher.ret(cypher.distinct('p')));
		this.db.cypher({
			query: query.join('\n'),
			params: {name: name}
		}, function (err, result) {
			if(err) cb(err);
			else {
				var persons = [], count = 0;
				result.forEach(function (res) {
					if(count++ >= maxLength) return;
					var person = new Concept(self.url, res.p._id, res.p.labels, res.p.properties);
					persons.push(person);
				});
				cb(null, persons);
			}
		});
	}
});
module.exports = ConceptManager;