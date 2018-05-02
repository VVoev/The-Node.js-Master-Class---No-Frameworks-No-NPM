//exampel vm


//dependancies
var vm = require('vm');

//define a context
var context = {
    'foo': 25
};

var script = new vm.Script(`
    foo = foo*2;
    var bar = foo + 1;
    var fizz = 52;
`)


//run 
script.runInNewContext(context);
console.log(context);