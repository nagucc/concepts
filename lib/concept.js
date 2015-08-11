
/*
Concept类的特征
1. 默认标签为：Concept
2. 都有一个唯一标识：id
*/


var cypher = require('./cypher-utils');
var neo = require('neo4j');
var Class = require('js.class');

var Concept = Class({
	
	/*
	构造函数
	*/
	create: function(url, id, labels, properties) {
		this.id = id;
		this.url = url;
		this.labels = labels;
		this.properties = properties;
		if(url)
			this.db = new neo.GraphDatabase({url:url});
	},
	
	addName: function (name, callback) {
		this.addPv({label: 'hasName'}, {
			label: 'Name',
			data: {text: name}
		}, callback);
	},
	
	removeName: function (name, cb) {
		this.removePv({label:'hasName'}, {
			label: 'Name',
			data: { text: name }
		}, cb);
	},
	
	
	names: function (callback) {
		this.getPvs({label: 'hasName'}, function(err, values){
			if(err) callback(err);
			else {
				var names = [];
				values.forEach(function(element) {
					names.push(element.properties.text);
				}, this);
			}
			callback(null, names);
		});
	},

	descriptions: function (cb) {
		this.getPvs({label:'hasDescription'}, function(err, values){
			if(err) cb(err);
			else {
				var names = [];
				values.forEach(function(element) {
					names.push(element.properties.text);
				}, this);
			}
			cb(null, names);
		});
	},
	
	addDesc: function (desc, cb) {
		this.addPv({label: 'hasDescription'}, 
			{
				label:'Description', 
				data:{ text: desc }
			}, cb);
	},
	
	removeDesc: function (desc, cb) {
		this.removePv({label:'hasDescription'}, {
			label: 'Description',
			data: {text: desc}
		}, cb);
	},
	
	/*
	为Concept添加属性值
	参数
		- property 属性
			- label
			- data
		- value 属性值
			- label
			- data
		- cb 回调函数	
	*/
	addPv: function(property, value, cb){
		var self = this;
		var query = [];
		query.push(cypher.match('p', Concept.LABEL));				// 匹配所有Concept节点
		query.push(cypher.idFilter('p', self.id));					// 根据id进行筛选
		query.push(cypher.merge('n', value.label, value.data));		// 确保value节点存在
		query.push(cypher.createConnect(							// 建立关系
			cypher.node('p'),
			cypher.node('n'),
			cypher.relationship('r', property.label, property.data),
			'forward'));
		self.db.cypher({query: query.join('\n')}, cb);				// 执行脚本
	},
	
	/*
	根据属性读取属性值
	参数
		- property optional 属性
			- label
			- data
		- cb 回调函数
			- err 错误
			- values 属性值数组。每个元素定义如下：
				- _id
				- labels Array
				- properties object
	*/
	getPvs: function(property, cb){
		var cb = arguments[arguments.length - 1];
		property = property || {};
		var self = this;
		var q = [];
		q.push(cypher.matchConnect(
			cypher.node('p', Concept.LABEL),
			cypher.node('v'),
			cypher.relationship('', property.label, property.data),
			'forward'
		));
		q.push(cypher.idFilter('p', self.id));
		q.push(cypher.ret('v'));
		self.db.cypher({query: q.join('\n')}, function(err, result){
			var values = [];
			result.forEach(function(element) {
				values.push(element.v);
			}, this);
			cb(err, values);
		});
	},
	
	
	/*
	删除属性值
	参数
		- property 属性
			- label
			- data
		- value 属性值
			- label
			- data
		- cb 回调函数	
	*/
	removePv: function(property, value, cb){
		var self = this;
		var q = [];
		q.push(cypher.matchConnect(
				cypher.node('c', Concept.LABEL),
				cypher.node('v', value.label, value.data),
				cypher.relationship('p', property.label, property.data),
				'forward'
			),
			cypher.idFilter('c', self.id),
			cypher.del('p')
		);
		self.db.cypher({query: q.join('\n')}, cb);
	}
}).static({
	LABEL: 'Concept'
});

module.exports = Concept;