/* global process */
/* global it */
/* global describe */
var should = require("should");
var neo = require('neo4j');
var ConceptManager = require('../lib/concept-manager');

var url = process.env.NEO_HOST || 'http://neo4j.ynu.edu.cn';
var db = new neo.GraphDatabase({url:url});

var cm = new ConceptManager(db);

describe('Concept model test', function () {

	var concept_id = null;
	var con = null;
	it('create.创建Concept', function (done) {
		cm.create(function (err, concept) {
			should.not.exist(err);
			concept.id.should.above(0);
			concept_id = concept.id;
			con = concept
			done();
		});
	});

	it('get.获取Concept', function (done) {
		cm.get(concept_id, function (err, concept) {
			concept.id.should.above(0);
			done();
		});
	});
	
	it('addName.添加Concept的name', function(done){
		con.addName('testName', function(err, result){
			con.names(function(err, names){
				names.length.should.above(0);
				names[0].should.eql('testName');
				done();
			});
		});
	});
	
	it('addDesc', function(done){
		con.addDesc('testDesc', function(err, result){
			con.descriptions(function(err, values){
				values.length.should.above(0);
				values[0].should.eql('testDesc');
				done();
			});
		});
	});
	
	it('removeName.删除Concept的name', function(done){
		con.removeName('testName', function(err, result){
			should.not.exist(err);
			con.names(function(err, names){
				names.length.should.eql(0);
				done();
			});
		});
	});
	
	
	
	
	it('del.删除Concept', function (done) {
		cm.del(concept_id, function (err, result) {
			should.not.exist(err);
			done();
		});
	});
});