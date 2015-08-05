
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

Concept.label = 'Concept';

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
};

Concept.prototype.addName = function (name, callback) {
	this.addPv({label: 'hasName'}, {
		label: 'Name',
		data: {text: name}
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
};

Concept.prototype.addDesc = function (desc, cb) {
	this.addPv({label: 'hasDescription'}, 
		{
			label:'Description', 
			data:{ text: desc }
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
Concept.prototype.addPv = function(property, value, cb){
	var self = this;
	var query = [];
	query.push(cypher.match('p', Concept.label));				// 匹配所有Concept节点
	query.push(cypher.idFilter('p', self.id));					// 根据id进行筛选
	query.push(cypher.merge('n', value.label, value.data));		// 确保value节点存在
	query.push(cypher.createConnect(							// 建立关系
		cypher.node('p'),
		cypher.node('n'),
		cypher.relationship('r', property.label, property.data),
		'forward'));
	self.db.cypher({query: query.join('\n')}, cb);				// 执行脚本
};

/*
根据属性读取属性值
参数
	- property 属性
		- label
		- data
	- cb 回调函数
		- err 错误
		- values 属性值数组。每个元素定义如下：
			- _id
			- labels Array
			- properties object
*/
Concept.prototype.getPvs = function(property, cb){
	var cb = arguments[arguments.length - 1];
	property = property || {};
	var self = this;
	var q = [];
	q.push(cypher.matchConnect(
		cypher.node('p', Concept.label),
		cypher.node('v'),
		cypher.relationship('', property.label, property.data),
		'forward'
	));
	q.push(cypher.idFilter('p', self.id));
	q.push(cypher.ret('v'));
	self.db.cypher({query: q.join('\n')}, function(err, result){
		// console.log(JSON.stringify(result));
		var values = [];
		result.forEach(function(element) {
			values.push(element.v);
		}, this);
		// console.log(JSON.stringify(values));
		cb(err, values);
	});
};

module.exports = Concept;