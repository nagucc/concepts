var ConceptManager = require('./concept-manager.js');
var neo = require('neo4j');

var Middleware = function(url){
	this.neo_url = url;
	this.db = new neo.GraphDatabase({url:url});
	this.cm = new ConceptManager(url);
};


/*
Connect中间件：创建Concept
输出
	- res.err 创建时出现的错误
	- res.concept 被创建的Concept的对象
*/
Middleware.prototype.create = function(){
	var self = this;
	return function(req, res, next){
		self.cm.addNew(function(err, concept){
			res.err = err;
			res.concept = req.concept = concept;
			next();
		});
	};
};


/*
中间件：获取Concept
输入
	- req.concept.id Concept的id
输出
	- res.err
	- res.concept
*/
Middleware.prototype.get = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.id){
			self.cm.get(req.concept.id, function(err, concept){
				res.err = err;
				res.concept = req.concept = concept;
				next();
			});
		} else {
			res.err = 'invalid concept.id';
			next();
		}
	};	
}


/*
中间件：删除Concept
输入
	- req.concept.id
输出
	- res.err
*/
Middleware.prototype.del = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.id){
			self.cm.del(req.concept.id, function(err){
				res.err = err;
				next();
			});
		} else {
			res.err = 'invalid concept.id';
			next();
		}
	};
};

/*
根据name找出所有Concept
输入：
	- req.concept.name
	- req.concept.maxLength 默认 100
输出：
	- res.err
	- res.conceptList
*/
Middleware.prototype.findByName = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.name){
			req.concept.maxLength = req.concept.maxLength || 100;
			self.cm.findByName(req.concept.name, req.concept.maxLength, function(err, concepts){
				res.conceptList = [];
				concepts.forEach(function(c) {
					res.conceptList.push({
						id: c.id
					});
				}, this);
				next();
			});
		} else {
			res.err = 'you should set a value for req.concept.name';
			next();
		}
	};
};


/*
中间件：为节点添加属性值
输入
	- req.concept 或 req.concept.id
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
Middleware.prototype.addPv = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.property && req.concept.value){
			if(req.concept.addPv instanceof Function){
				req.concept.addPv(req.concept.property, req.concept.value, function(err){
					res.err = err;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
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
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide property and value';
				next();
		}
	}
};


/*
中间件：获取Concept的属性值列表
输入
	- req.concept 或 req.concept.id
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
Middleware.prototype.getPvs = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.property){
			if(req.concept.getPvs instanceof Function){
				req.concept.getPvs(req.concept.property, function(err, values){
					res.err = err;
					res.concept = {pvs: values};
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
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
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide property';
				next();
		}
	}
};


/*
中间件：删除属性值
输入
	- req.concept 或 req.concept.id
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
Middleware.prototype.removePv = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.property && req.concept.value){
			if(req.concept.removePv instanceof Function){
				req.concept.removePv(req.concept.property, req.concept.value, function(err){
					res.err = err;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
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
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide property and value';
				next();
		}
	}
}



/*
中间件：添加name
输入：
	- req.concept.id 或 req.concept 对象
	- req.concept.name
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.addName = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.name){
			var name = req.concept.name;
			if(req.concept.addName instanceof Function){
				req.concept.addName(name, function(err){
					res.err = err;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
					if(err) {
						res.err = err;
						next();
					} else {
						res.concept = req.concept = concept;
						req.concept.name = name;									// 恢复name的值
						req.concept.addName(name, function(err){
							res.err = err;
							next();
						});
					}
				});
			} else {
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide property and value';
				next();
		}
	}
}


/*
获取name列表
输入
	- req.concept 或 req.concept.id
	- req.concept.data
输出
	- res.err
	- req.concept
	- res.concept.nameList
*/
Middleware.prototype.names = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept){
			if(req.concept.names instanceof Function){
				req.concept.names(function(err, names){
					res.err = err;
					res.concept.nameList = names;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
					if(err) {
						res.err = err;
						next();
					} else {
						res.concept = req.concept = concept;
						req.concept.names(function(err, names){
							res.err = err;
							res.concept.nameList = names;
							next();
						});
					}
				});
			} else {
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide req.concept.id';
			next();
		}
	};
};

/*
删除name
输入
	- req.concept 或 req.concept.id
	- req.concept.name
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.removeName = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.name){
			var name = req.concept.name;
			if(req.concept.removeName instanceof Function){
				req.concept.removeName(name, function(err){
					res.err = err;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
					if(err) {
						res.err = err;
						next();
					} else {
						res.concept = req.concept = concept;			// 重置req.concept
						req.concept.name = name;						// 设置req.concept.name
						req.concept.removeName(name, function(err){
							res.err = err;
							next();
						});
					}
				});
			} else {
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide property and value';
				next();
		}
	};
}


/*
中间件：添加desc
输入：
	- req.concept.id 或 req.concept 对象
	- req.concept.desc
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.addDesc = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.desc){
			var desc = req.concept.desc;
			if(req.concept.addDesc instanceof Function){
				req.concept.addDesc(desc, function(err){
					res.err = err;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
					if(err) {
						res.err = err;
						next();
					} else {
						res.concept = req.concept = concept;						// 重设req.concept
						req.concept.desc = desc;									// 恢复desc的值
						req.concept.addDesc(desc, function(err){
							res.err = err;
							next();
						});
					}
				});
			} else {
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide req.concept.desc';
				next();
		}
	}
}


/*
获取desc列表
输入
	- req.concept 或 req.concept.id
	- req.concept.data
输出
	- res.err
	- req.concept
	- res.concept.descList
*/
Middleware.prototype.descs = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept){
			if(req.concept.descriptions instanceof Function){
				req.concept.descriptions(function(err, descs){
					res.err = err;
					res.concept.descList = descs;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
					if(err) {
						res.err = err;
						next();
					} else {
						res.concept = req.concept = concept;
						req.concept.descriptions(function(err, descs){
							res.err = err;
							res.concept.descList = descs;
							next();
						});
					}
				});
			} else {
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide req.concept.id';
			next();
		}
	}
};


/*
删除desc
输入
	- req.concept 或 req.concept.id
	- req.concept.desc
	- req.concept.data
输出
	- res.err
	- req.concept
*/
Middleware.prototype.removeDesc = function(){
	var self = this;
	return function(req, res, next){
		if(req.concept && req.concept.desc){
			var desc = req.concept.desc;
			if(req.concept.removeDesc instanceof Function){
				req.concept.removeDesc(desc, function(err){
					res.err = err;
					next();
				});
			} else if(req.concept.id) {
				self.cm.get(req.concept.id, function(err, concept){
					if(err) {
						res.err = err;
						next();
					} else {
						res.concept = req.concept = concept;
						req.concept.desc = desc;						// 设置desc
						req.concept.removeDesc(desc, function(err){
							res.err = err;
							next();
						});
					}
				});
			} else {
				res.err = 'invaild concept.id';
				next();
			}
		} else {
			res.err = 'you should provide req.conccept.desc';
				next();
		}
	};
}

module.exports = Middleware;
