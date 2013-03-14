var nl = require("nodeload");
var MultiLoop = require('nodeload/lib/loop').MultiLoop;

var Membase = require('../');
var membases = [];
var numClients = 1;
for(var i=0;i<numClients;i++){
    //membases.push(new Membase("127.0.0.1:11211", {poolSize:10}));
    membases.push(new Membase("10.80.81.242:11211", {poolSize:10}));
}

var count = 0;
var start = new Date().getTime();

function sum(){
    var end = new Date().getTime();
    var diff = (end-start)/1000;
    var rps = count/diff;
    console.log("*********************************"+rps + "rps");
    count = 0;
    start = new Date().getTime();
}

function go(finished){
    //random key
    var key = "KEY_" + Math.random() * 0x10000;
    var value = key; 
    var clientNum = Math.floor(Math.random() * numClients);
    var client = membases[clientNum];
    setGet(client);

    //set
    function setGet(m){
        m.set(key, value, 60, function(err, result){
            if (err){
                throw new Error(err);
            }

            m.get(key, function(err, result){
                count++;
                if (err){
                    throw new Error(err);
                }
                if (key!=result) {
                    console.log("*BAD: key:" + key + " result: " + result);
                    throw new Error("ru oh");
                }
                if (count>1000){
                    sum();
                }

            });
        } );
    }
    // this is part of multiloop protocol, call the passed function
    finished();
}

l = new MultiLoop({
    fun: go,
    rpsProfile: [[0, Infinity]],
    concurrencyProfile: [[0, 100]],
    duration: 60,
    delay: 0,
    numberOfTimes: Infinity
});
l.start();
l.on('end',
    function() {
    //    console.log('Total requests: ' + requests)
    });

/*
 loop = new MultiLoop({
 fun: wrapper,
 argGenerator: null,
 concurrencyProfile: [[0, 100]],
 rpsProfile: [[0, Infinity]],
 duration: 60,
 numberOfTimes: Infinity,
 delay: 0
 });
 loop.on('add', function() {
 console.log("on add");
 });
 loop.start();
 loop.on('end', function() {
 process.exit(0);
 });
    */
