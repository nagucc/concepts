var Concept = require('./concept.js');
var ConceptManager = require('./concept-manager.js');
var neo = require('neo4j');

var Middleware = function(url){
	this.neo_url = url;
	this.db = new neo.GraphDatabase({url:url});
	this.cm = new ConceptManager(this.db);
};


/*
Connect中间件：创建Concept
输出
	- res.err 创建时出现的错误
	- res.concept 被创建的Concept的对象
*/
Middleware.prototype.create = function(req, res, next){
	var self = this;
	self.cm.create(function(err, concept){
		res.err = err;
		res.concept = concept;
		next();
	});
};

/*
中间件：获取Concept
输入
	- req.concept._id Concept的id
输出
	- res.err
	- res.concept
*/
Middleware.prototype.get = function(req, res, next){
	if(req.concept && req.concept._id){
		this.cm.get(req.concept._id, function(err, concept){
			res.err = err;
			res.concept = concept;
			next();
		});
	} else {
		res.err = 'invalid concept._id';
		next();
	}
};

/*
中间件：删除Concept
输入
	- req.concept._id
输出
	- res.err
*/
Middleware.prototype.del = function(req, res, next){
	if(req.concept && req.concept._id){
		this.cm.del(req.concept._id, function(err){
			res.err = err;
			next();
		});
	} else {
		res.err = 'invalid concept._id';
		next();
	}
};


/*
中间件：为节点添加属性值
输入
	- req.concept 或 req.concept._id
	- req.concept.property
		- label
		- data
	- req.concept.value
		- label
		- data
输出
	- res.err
	- res.concept
	- req.concept
*/
Middleware.prototype.addPv = function(req, res, next){
	var self = this;
	if(req.concept && req.concept.property && req.concept.value){
		if(req.concept.addPv instanceof Function){
			req.concept.addPv(req.concept.property, req.concept.value, function(err){
				res.err = err;
				next();
			});
		} else if(req.concept._id) {
			self.cm.get(req.concept._id, function(err, concept){
				if(err) {
					res.err = err;
					next();
				} else {
					res.concept = req.concept = concept;
					req.concept.addPv(req.concept.property, req.concept.value, function(err){
						res.err = err;
						next();
					});
				}
			});
		} else {
			res.err = 'invaild concept._id';
			next();
		}
	} else {
		res.err = 'you should provide property and value';
			next();
	}
}

/*
中间件：获取Concept的属性值列表
输入
	- req.concept 或 req.concept._id
	- req.concept.property
		- label
		- data
输出
	- res.err
	- req.concept
	- res.concept.pvs 数组，元素结构：
		- labels
		- properties
*/
Middleware.prototype.getPvs = function(req, res, next){
	var self = this;
	if(req.concept && req.concept.property){
		if(req.concept.getPvs instanceof Function){
			req.concept.getPvs(req.concept.property, function(err, values){
				res.err = err;
				res.concept = {pvs: values};
				next();
			});
		} else if(req.concept._id) {
			self.cm.get(req.concept._id, function(err, concept){
				if(err) {
					res.err = err;
					next();
				} else {
					res.concept = req.concept = concept;
					req.concept.getPvs(req.concept.property, function(err, values){
						res.err = err;
						res.concept = {pvs: values};
						next();
					});
				}
			});
		} else {
			res.err = 'invaild concept._id';
			next();
		}
	} else {
		res.err = 'you should provide property';
			next();
	}
}

/*
中间件：删除属性值
输入
	- req.concept 或 req.concept._id
	- req.concept.property
		- label
		- data
	- req.concept.value
		- label
		- data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.removePv = function(req, res, next){
	var self = this;
	if(req.concept && req.concept.property && req.concept.value){
		if(req.concept.removePv instanceof Function){
			req.concept.removePv(req.concept.property, req.concept.value, function(err){
				res.err = err;
				next();
			});
		} else if(req.concept._id) {
			self.cm.get(req.concept._id, function(err, concept){
				if(err) {
					res.err = err;
					next();
				} else {
					res.concept = req.concept = concept;
					req.concept.removePv(req.concept.property, req.concept.value, function(err){
						res.err = err;
						next();
					});
				}
			});
		} else {
			res.err = 'invaild concept._id';
			next();
		}
	} else {
		res.err = 'you should provide property and value';
			next();
	}
}


/*
中间件：添加name
输入：
	- req.concept._id 或 req.concept 对象
	- req.concept.name
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.addName = function(req, res, next){
	if(req.concept && req.concept.name){
		req.concept.property = { label: 'hasName', data: req.concept.data };
		req.concept.value = { label: 'Name', data: { text: req.concept.name }};
		this.addPv(req, res, next);
	} else {
		res.err = 'you should provide a name for the concept.';
		next();
	}
}

/*
获取name列表
输入
	- req.concept 或 req.concept._id
	- req.concept.data
输出
	- res.err
	- req.concept
	- res.concept.nameList
*/
Middleware.prototype.names = function(req, res, next){
	if(req.concept){
		req.concept.property = { label: 'hasName', data: req.concept.data };
		this.getPvs(req, res, function(req, res, next){
			if(res.concept && res.concept.pvs){
				res.concept.nameList = []
				res.concept.pvs.forEach(function(pv) {
					res.concept.nameList.push(pv.properties.text);
				}, this);
			}
		});
	} else {
		res.err = 'you should set req.concept firstly';
		next();
	}
};

/*
删除name
输入
	- req.concept 或 req.concept._id
	- req.concept.name
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.removeName = function(req, res, next){
	if(req.concept && req.concept.name){
		req.concept.property = {label:'hasName', data: req.concept.data};
		req.concept.value = {label:'Name', data: {text: req.concept.name}};
		this.removePv(req, res, next);
	} else {
		res.err = 'you should set a value for req.concept.name firstly';
		next();
	}
};

/*
中间件：添加desc
输入：
	- req.concept._id 或 req.concept 对象
	- req.concept.desc
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.addDesc = function(req, res, next){
	if(req.concept && req.concept.desc){
		req.concept.property = { label: 'hasDescription', data: req.concept.data };
		req.concept.value = { label: 'Description', data: { text: req.concept.desc }};
		this.addPv(req, res, next);
	} else {
		res.err = 'you should set a value for req.concept.desc';
		next();
	}
}


/*
获取desc列表
输入
	- req.concept 或 req.concept._id
	- req.concept.data
输出
	- res.err
	- req.concept
	- res.concept.descList
*/
Middleware.prototype.descs = function(req, res, next){
	if(req.concept){
		req.concept.property = { label: 'hasDescription', data: req.concept.data };
		this.getPvs(req, res, function(req, res, next){
			if(res.concept && res.concept.pvs){
				res.concept.descList = []
				res.concept.pvs.forEach(function(pv) {
					res.concept.descList.push(pv.properties.text);
				}, this);
			}
		});
	} else {
		res.err = 'you should set req.concept firstly';
		next();
	}
};

/*
删除desc
输入
	- req.concept 或 req.concept._id
	- req.concept.desc
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.removeDesc = function(req, res, next){
	if(req.concept && req.concept.desc){
		req.concept.property = {label:'hasDescription', data: req.concept.data};
		req.concept.value = {label:'Description', data: {text: req.concept.desc}};
		this.removePv(req, res, next);
	} else {
		res.err = 'you should set a value for req.concept.desc firstly';
		next();
	}
};

module.exports = Middleware;
