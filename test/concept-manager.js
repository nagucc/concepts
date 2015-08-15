/* global process */
/* global it */
/* global describe */
var should = require("should");
var ConceptManager = require('../lib/concept-manager');
var Concept = require('../lib/concept');

var url = process.env.NEO_HOST || 'http://neo4j.ynu.edu.cn';
console.log('url: ' + url);
var cm = new ConceptManager(url);

describe('Concept model test', function () {

	var concept_id = null;
	var con = null;
	it('addNew.创建Concept', function (done) {
		this.timeout(15000);
		cm.addNew(function (err, concept) {
			should.not.exist(err);
			concept.id.should.above(-1);
			concept_id = concept.id;
			concept.labels.indexOf(Concept.LABEL).should.above(-1);
			con = concept
			done();
		});
	});

	it('get.获取Concept', function (done) {
		this.timeout(15000);
		cm.get(concept_id, function (err, concept) {
			concept.id.should.above(-1);
			done();
		});
	});
	
	it('addName.添加Concept的name', function(done){
		this.timeout(15000);
		con.addName('testName', {creator:'na' }, function(err, result){
			con.names(function(err, names){
				names.length.should.above(0);
				names[0].should.eql('testName');
				done();
			});
		});
	});
	
	it('addDesc', function(done){
		this.timeout(15000);
		con.addDesc('testDesc', function(err, result){
			con.descriptions(function(err, values){
				values.length.should.above(0);
				values[0].should.eql('testDesc');
				done();
			});
		});
	});

	it('在添加name和desc后，get可以获得properties', function (done) {
		this.timeout(15000);
		cm.get(concept_id, function (err, concept) {
			concept.id.should.above(-1);
			concept.properties.name.should.eql('testName');
			concept.properties.desc.should.eql('testDesc');
			done();
		});
	});
	
	it('findByName', function(done){
		this.timeout(15000);
		cm.findByName('testName', function(err, cs){
			cs.length.should.above(0);
			done();
		});
	});
	
	it('removeName.删除Concept的name', function(done){
		this.timeout(15000);
		con.removeName('testName', function(err, result){
			should.not.exist(err);
			con.names(function(err, names){
				names.length.should.eql(0);
				done();
			});
		});
	});
	
	it('removeDesc', function(done){
		this.timeout(15000);
		con.removeDesc('testDesc', function(err){
			should.not.exist(err);
			con.descriptions(function(err, descs){
				descs.length.should.eql(0);
				done();
			});
		});
	});

	it('addPv(property, Concept).将当前节点和现有节点连接起来', function (done) {
		this.timeout(15000);
		con.addPv({
			label: 'TestRelationship',
			values: {creator: 'na', dateCreated: new Date()}
		}, new Concept(url, 163), function (err, result) {
			should.not.exist(err);
			done();
		});
	});

	it('removePv', function  (done) {
		this.timeout(15000);
		con.removePv({
			label: 'TestRelationship',
			values: {creator: 'na', dateCreated: new Date()}
		}, new Concept(url, 163), function (err, result) {
			should.not.exist(err);
			done();
		});
	})
	
	
	it('del.删除Concept', function (done) {
		this.timeout(15000);
		cm.del(con, function (err, result) {
			should.not.exist(err);
			done();
		});
	});
});