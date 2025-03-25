// package
// module
// task
import {taskBuild, taskWatch} from './_task/_output.js';

// 処理本体
console.log('----- .npm_scripts/develop.js: run -----');
await taskBuild.run();
await taskWatch.run();