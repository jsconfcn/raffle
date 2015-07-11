#!/usr/bin/env node

var fs    = require('fs');
var path  = require('path')

function Raffle(people){
  if(!(this instanceof Raffle)){
    return new Raffle(people);
  }
  this.people    = people;
  this.blacklist  = [ 0 ];
  this.dbFile     = path.basename(__dirname, '.js') + '.json';
};

Raffle.prototype.random = function(size){
  this.read();
  var i = 0;
  var luckyBoys = [];
  while(this.blacklist.length <= this.people &&  i < size){
    var r = ((Math.random() * this.people).toFixed(0));
    if(!~this.blacklist.indexOf(r)){
      console.log("> %s", r);
      this.blacklist.push(r);
      i++;
    }else{
      luckyBoys.push(r);
    }
  }
  this.write();

  if(luckyBoys.length > 0){
    console.log(Array(81).join('=')); // terminal columns default is 80;
    console.log("lucky boy is (if u need):");
    console.log("%s", luckyBoys.join('\n'));
  }

  if(this.blacklist.length === this.people){
    console.log('> WOW! nothing .');
  }
};

Raffle.prototype.write = function(){
  fs.writeFileSync(this.dbFile, JSON.stringify(this.blacklist));
};

Raffle.prototype.read = function(){
  if(!fs.existsSync(this.dbFile)){
    return this.write();
  }
  var content = fs.readFileSync(this.dbFile);
  this.blacklist = JSON.parse(content);
};

//
Raffle(600).random(process.argv[2] || 1);
