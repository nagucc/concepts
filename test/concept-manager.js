/* global it */
/* global describe */
var should = require("should");
var neo = require('neo4j');
var ConceptManager = require('../lib/concept-manager');

var url = 'http://neo4j.nagu.cc';
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
			should.not.exist(err);
			concept.id.should.above(0);
			done();
		});
	});
	
	it('del.删除Concept', function (done) {
		cm.del(concept_id, function (err, result) {
			should.not.exist(err);
			done();
		});
	});
});