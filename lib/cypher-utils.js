/*
将对象转换为cypher可以用的json字符串
*/
var toJson = function (data) {
	var str = [];
	str.push('{');
	var params = [];
	for(var o in data){
		var val = o+':' + JSON.stringify(data[o]);
		// var val = o+':';
		// if(typeof data[o]  === 'number') val += data[o];
		// else  val += '"'+data[o] + '"';
		params.push(val);
	}
	str.push(params.join(','));
	str.push('}');
	return str.join('');
};

/*
生成节点字符串
参数
	- variable 变量名
	- label 标签名
	- data 过滤参数
返回值
	- (variable:label{data->tojson})
*/
var node = function (variable, label, data) {
	var str = [];
	str.push('(');
	if(variable) str.push(variable);
	if(label){
		str.push(':');
		str.push(label);
	}
	if(data) str.push(toJson(data));
	str.push(')');
	return str.join('');
};

/*
生成描述关系的字符串
参数
	- variable 变量名
	- label 标签名
	- data 过滤参数
返回值
	[variable:label{data->tojson}]	
*/
var relationship = function (variable, label, data) {
	var str = [];
	str.push('[');
	if(variable) str.push(variable);
	if(label){
		str.push(':');
		str.push(label);
	}
	if(data) str.push(toJson(data));
	str.push(']');
	return str.join('');
};

/*
生成关系连接字符串
参数
	- one string 起始节点
	- two string 结束节点
	- relationshiop string 关系节点
	- dirrection string 方向 值可以是'back'或'forward'
返回值
	(one)-[relationship]->(two)
*/
var connect = function (one, two, relationship, direction) {
	if(one.indexOf('(') === -1) one = '(' + one + ')';
	if(two.indexOf('(') === -1) two = '(' + two + ')';
	if(relationship.indexOf('[') === -1) relationship = '[' + relationship + ']';

	var str = one;
	if(direction === 'back') str += '<';
	str += '-';
	str += relationship;
	str += '-';
	if(direction === 'forward') str += '>';
	str += two;
	return str;
};

module.exports = {
	
	/*
	生成创建节点用的cypher语句
	*/
	create: function (variable, label, data) {
		return 'CREATE ' + node(variable, label, data);
	},
	match: function (variable, label, data) {
		return 'Match ' + node(variable, label, data);
	},
	merge: function (variable, label, data) {
		return 'MERGE ' + node(variable, label, data);
	},
	ret: function (variable) {
		variable = variable || '';
		return 'RETURN ' + variable;
	},
	del: function (variable) {
		return 'DELETE ' + variable;
	},
	idFilter: function (variable, id) {
		return 'Where id(' + variable + ') = ' + id;
	},
	node: node,
	relationship: relationship,
	connect: connect,
	createConnect: function (one, two, relationship, direction) {
		return 'CREATE ' + connect(one, two, relationship, direction);
	},
	mergeConnect: function(one, two, relationship, direction){
		return 'MERGE ' + connect(one, two, relationship, direction);		
	},
	matchConnect: function (one, two, relationship, direction) {
		return 'MATCH ' + connect(one, two, relationship, direction);
	},
	toJson: toJson
}