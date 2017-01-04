var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var rewire = require('rewire');
var index_wired = rewire('./../index.js');

//var event = require('./../event.json');
//var context = require('./../context.json');


var AWS = require('aws-sdk');
var ec2 = new AWS.EC2({
    apiVersion: '2016-04-01',
    region: 'ap-northeast-1'
});

var ec2params = {
    Filters: [{
        Name: 'tag-key',
        Values: ['OpsTimer']
//            Name: 'tag:OpsTimer',
//            Values: ['1000-1700']
//            Name: 'tag-value',
//            Values: ['1000-1700']
    }]

};

describe('InstacesTimer', function() {
    describe('validate-timer', function() {
        var validate_timer = index_wired.__get__('validateTimer');

        it('should return true when xxxx-yyyy', function() {
            expect(validate_timer('0800-1700')).to.equal(true);
        });
        it('should return false outside 0000-2400 are passed in', function() {
            expect(validate_timer('0800-2700')).to.equal(false);
        });
        it('should return false when start time is after stop time', function() {
            expect(validate_timer('1800-1700')).to.equal(false);
        });
        it('should return fales when other format different from xxxx-yyyy', function() {
            expect(validate_timer('08001700')).to.equal(false);
        });
    });
    describe('getEC2instances', function() {
        var getEC2instances = index_wired.__get__('getEC2instances');
        var expect_idtag = require('./expect_idtag');

        it('(async) should return instanceID and tag information after filitering', function(done) {
            var actual = [];
            getEC2instances(ec2params, actual, function(data){
                expect(JSON.stringify(data)).to.equal(JSON.stringify(expect_idtag));
                done();
            });
        });
        it('(sync) should return instanceID and tag information after filitering', function() {
            var actual = [];
            getEC2instances(ec2params, actual,null)
                .then(function(data){
                        expect(JSON.stringify(data)).to.equal(JSON.stringify(expect_idtag));
                });
        });
    });
});
