//repl server


//dep
var repl = require('repl');

repl.start({
    prompt: '>>>',
    eval: (str) => {
        console.log(`Evaluation stage ${str}`)
        str.indexOf('fizz') > -1 ?
            console.log('buzz') :
            console.log('try again');
    }
})