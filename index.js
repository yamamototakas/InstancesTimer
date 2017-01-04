const ec2params = {
    Filters: [{
        Name: 'tag-key',
        Values: ['OpsTimer']
//            Name: 'tag:OpsTimer',
//            Values: ['1000-1700']
//            Name: 'tag-value',
//            Values: ['1000-1700']
    }]
};


const AWS = require('aws-sdk');
const ec2 = new AWS.EC2({
    apiVersion: '2016-04-01',
    region: 'ap-northeast-1'
    });


var validateTimer = function(value) {
    "use strict";
    if (value === null || value === undefined) return false;
    var result = value.match(/([0-2][0-9])([0-6][0-9])-([0-2][0-9])([0-6][0-9])/);

    if(!result){
        console.log("Found value of ", value, ", but expected format is like 0800-1700");
        return false;
    }
    if(result[1] > 24 || result[2] > 60 || result[3] > 24 || result[4] > 60){
        console.log("Found value of ", value, ", but expected value is 'hhmm-hhmm' like 0800-1700");
        return false;
    }


    if(result){
        var start=result[1]+result[2], end=result[3]+result[4];
        if(start > end){
            console.log("Found value of ", value, ", but Start time should be before Stop time");
            return false;
        }
        return true;
    }
};

function getEC2instances(params, myInstances, callback){
    "use strict";
    const promise = new Promise((resolve, reject) => {

        ec2.describeInstances(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                context.done('error in exe', err.stack);
                reject(err);
            }
            else if(data.Reservations.length === 0){
                console.log('No action. No instances with ', params.Filters[0].Values[0],' tag.');
                resolve(undefined);
            }
            else{
                for(var each of data.Reservations){
                    for(var instance of each.Instances){
                        for(var tag of instance.Tags){
                            var temp_id={};
                            if(tag.Key === params.Filters[0].Values[0] && validateTimer(tag.Value)){
                                temp_id.InstanceId=instance.InstanceId;
                                temp_id.Tag=tag;
                                myInstances.push(temp_id);
                            }
                        }
                    }
                }
                if(myInstances.length === 0){
                    console.log("No instances with valid format. Please check format");
                    resolve(undefined);
                }
                resolve(myInstances);
            }
        });
    });
    if(typeof callback !== 'function')
        return promise;
    promise
        .then(data => callback(data))
        .catch(callback);
}

exports.handler = function(event, context) {
    "use strict";
    console.log("Start");
    console.log(JSON.stringify(event, null, '    '));
    console.log(JSON.stringify(context, null, '    '));

    console.log(ec2params);
    //console.log(ec2);


    var instances = [];
    console.log("Call myEC2");
    getEC2instances(ec2params,instances,null)
        .then(function(data){
                console.log("instances=", JSON.stringify(data, null, '   '));
        });
};
