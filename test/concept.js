// var should = require("should");
// var neo = require('neo4j');
// var Person = require('../lib/person');

// var url = 'http://neo4j.ynu.edu.cn';
// var db = new neo.GraphDatabase({url:url});

// var one = new Person(null, db);

// describe('Person model test', function () {

// 	it('create.创建Person', function (done) {
// 		one.create('name', 'desc', function (err, result) {
// 			should.not.exist(err);
// 			one.id.should.above(0);
// 			done();
// 		});
// 	});

// 	it('addName.添加name', function (done) {
// 		one.addName('name2', function (err, result) {
// 			should.not.exist(err);
// 			done();
// 		});
// 	});

// 	it('names.获取Person的所有name', function (done) {
// 		one.names(function (err, result) {
// 			should.not.exist(err);
// 			(result.length).should.eql(2);
// 			done();
// 		});
// 	});

// 	it('removeName.删除Person的name', function (done) {
// 		one.removeName('name', function (err, result) {
// 			should.not.exist(err);
// 			one.names(function (err, result) {
// 				should.not.exist(err);
// 				(result.length).should.eql(1);
// 				done();
// 			});
// 		});
// 	});

// 	it('addDesc.添加desc', function (done) {
// 		one.addDesc('desc2', function (err, result) {
// 			should.not.exist(err);
// 			done();
// 		});
// 	});

// 	it('descriptions.获取Person的所有desc', function (done) {
// 		one.descriptions(function (err, result) {
// 			should.not.exist(err);
// 			(result.length).should.eql(2);
// 			done();
// 		});
// 	});

// 	it('removeDesc.删除Person的desc', function (done) {
// 		one.removeDesc('desc', function (err, result) {
// 			should.not.exist(err);
// 			one.descriptions(function (err, result) {
// 				should.not.exist(err);
// 				(result.length).should.eql(1);
// 				done();
// 			});
// 		});
// 	});

// 	it('findByName.根据名字查找Person', function (done) {
// 		one.findByName('name2', function (err, persons) {
// 			should.not.exist(err);
// 			persons.length.should.eql(1);
// 			done();
// 		});
// 	});


// 	it('delete.删除Person', function (done) {
// 		one.delete(function (err, result) {
// 			should.not.exist(err);
// 			should.not.exist(one.id);
// 			done();
// 		});
// 	});
// });