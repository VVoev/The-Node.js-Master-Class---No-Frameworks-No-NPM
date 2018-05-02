

//dep
var async_hooks = require('async_hooks');
var fs = require('fs');

//target execution context
var targetExContext = false;
//arbitrary async func

var whatTimeIsIt = (cb) => {
    setInterval(() => {
        fs.writeSync(1, 'When the set interval runs,the execution contect is ' + async_hooks.executionAsyncId() + '\n');
        cb(Date.now());
    }, 1000)
}

//call the fn
whatTimeIsIt((time) => {
    fs.writeSync(1, `The time is ${time} \n`)
})

//hooks
var hooks = {
    init(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook init' + asyncId + '\n')
    },
    before(asyncId) {
        fs.writeSync(1, 'Hook before' + asyncId + '\n')
    },
    after(asyncId) {
        fs.writeSync(1, 'Hook after' + asyncId + '\n')
    },
    destroy(asyncId) {
        fs.writeSync(1, 'Hook destroy' + asyncId + '\n')
    },
    promiseResolve(asyncId) {
        fs.writeSync(1, 'Hook promiseResolve' + asyncId + '\n')
    }
}

//create new instance of async

var asyncHooks = async_hooks.createHook(hooks);
asyncHooks.enable();