// package
// module
import {taskBuild, taskWatch} from './_module/_task.js';

console.log('----- .npm_scripts/develop.js: run -----');

// 処理本体
await taskBuild.run();
await taskWatch.run();