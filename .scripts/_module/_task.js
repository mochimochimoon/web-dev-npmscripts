// package
// import fs from 'fs';
import path from 'path';
import {deleteSync} from 'del';
import watch from 'glob-watcher';
// module
import command from './_command.js';
import {convertorPugAsync, convertorEjsAsync} from './_convertor/_convertor-html-template-async.js';
import convertorSassAsync from './_convertor/_convertor-sass-async.js';
import convertorImgAsync from './_convertor/_convertor-img-async.js';
import convertorJsAsync from './_convertor/_convertor-js-async.js';
import fileOutputAsync from './_file-output-async.js';
import browserSyncInit from './_browser-sync-init.js';

const _OUTPUTSETTINGS = [
  // 変換なし
  {
    name: 'raw',
    settings: [
      {
        // ext: false,
        rootDir: './src/raw',
        baseDir: './src/raw/base',
        // convertor: false,
      }
    ],
  },
  {
    name: 'html',
    settings: [
      {
        ext: 'html',
        rootDir: './src/ejs/',
        baseDir: './src/ejs/base/',
        convertor: convertorEjsAsync,
      },
      {
        ext: 'html',
        rootDir: './src/pug/',
        baseDir: './src/pug/base/',
        convertor: convertorPugAsync,
      },
    ]
  },
  {
    name: 'css',
    settings: [
      {
        ext: 'css',
        rootDir: './src/scss',
        baseDir: './src/scss/base',
        convertor: convertorSassAsync,
      },
    ],
  },
  {
    name: 'js',
    settings: [
      {
        ext: 'js',
        rootDir: './src/js',
        baseDir: './src/js/base',
        convertor: convertorJsAsync,
      }
    ],
  },
  {
    name: 'img',
    settings: [
      {
        // ext: false,
        rootDir: './src/img',
        baseDir: './src/img/base',
        convertor: convertorImgAsync,
      },
      {
        // ext: false,
        rootDir: './src/img',
        baseDir: './src/img/base',
        convertor: convertorImgAsync,
        modifier: '_min',
        option: {scale: 0.5},
      },
    ],
  },
];

const _COMMAND = command();

const _DIST = `${(!_COMMAND.option.deploy)? '_': ''}${_COMMAND.name || 'null'}`;

class Task {
  constructor(name, callback) {
    this.name = name;
    this.callback = callback;
  }
  async run() {
    console.log(`--- task[${this.name}]: status_start...`);
    try {
      await this.callback();
    } catch(e) {
      console.log(`--- task[${this.name}]: ...status_error`);
      console.log(e.message);
    }
    console.log(`--- task[${this.name}]: ...status_end`);
  }
};


for (let outputSetting of _OUTPUTSETTINGS) {
  outputSetting.task = new Task(outputSetting.name, async () => {
    await Promise.all(outputSetting.settings.map((item) => {
      fileOutputAsync(Object.assign({
        // rootDir: './src/raw',
        // baseDir: './src/raw/base',
        // convertor: false,
        // modifier: '_min',
        // option: {scale: 0.5},
        // ext: 'png',
        dist: _DIST,
      }, item))
    }));
  });
}

const taskBuild = new Task('build', async () => {
  deleteSync(_DIST, {force: false});
  await Promise.all(_OUTPUTSETTINGS.map((outputSetting) => {
    return outputSetting.task.run();
  }));
});

const taskWatch = new Task('watch', async () => {
  const htmlSettings = [].concat(..._OUTPUTSETTINGS.map((outputSetting) => {
    const htmlSetting = outputSetting.settings.filter((setting) => {
      return setting.ext === 'html';
    });
    return htmlSetting;
  }));
  const bs = browserSyncInit(_DIST, htmlSettings);

  for(let outputSetting of _OUTPUTSETTINGS) {
    const srcList = outputSetting.settings.map((setting) => {
      return path.join(setting.rootDir, '**/*'); 
    });

    watch(srcList.concat(['./src/.database/**/*', './src/.module/**/*']), async (done) => {
      if(outputSetting.name === 'html') {
        console.log('reload');
        bs.reload();
      }
      await outputSetting.task.run();
      if(outputSetting.name === 'css') {
        console.log('reflesh stream');
        bs.stream();
      } else if(outputSetting.name !== 'html') {
        console.log('reload');
        bs.reload();
      }
    });
  }
});

export {taskBuild, taskWatch};