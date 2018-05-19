#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')
const Path = require('path')
const anymatch = require('anymatch')
const cp = require('child_process')

/**
 * 配置命令行参数
 */
const argv = yargs
  .option('p', {
    alias: 'path', // 别名
    demand: false, // 必传参数
    default: '.', // 默认值
    describe: '要监听的文件或目录路径', // 描述
    type: 'string', // 参数类型，可以是 array、boolean、count、number、string
  })
  .option('i', {
    alias: 'ignore',
    demand: false,
    default: [],
    describe: '黑名单',
    type: 'array',
  })
  .option('d', {
    alias: 'depth',
    demand: false,
    default: undefined,
    describe: '扫描深度，如：0 即只监听当前目录下的文件',
    type: 'number',
  })
  .option('t', {
    alias: 'inteval',
    demand: false,
    default: 100,
    describe: '扫描间隔时间，单位 ms',
    type: 'number',
  })
  .usage('用法: fileWatch [options]')
  .help('h')
  .alias('h', 'help')
  .argv

/**
 * 监听目录/文件
 */
/**
 * fs.watch(filename[, options][, listener])
 * 观察 filename 指定的文件或文件夹的改变。返回对象是 fs.FSWatcher
 * 缺点：
 * 1. 不是 100% 的跨平台兼容，options 中的 recursive 参数仅在 OS X 上可用
 * 2. 在很多情况下会侦听到两次事件
 * 3. 不能指定监听目录的深度
 */
/**
 * fs.watchFile(filename[, options], listener)
 * 监视 filename 文件的变化。每当文件被访问的时候都会调用listener
 * 缺点：
 * 1. 很耗资源
 * 2. 不能监听目录，需要手动逐层遍历
 */

// 获取黑名单
const getIgnoreList = (path, ignore) => {
  let ignoreFile
  let ignoreList = []
  try {
    // 读取 ignore 文件
    ignoreFile = fs.readFileSync(Path.resolve(path, '.watch-ignore'), 'utf8')
  } catch (err) {}
  if (ignoreFile) {
    // 将文件按行拆成数组
    ignoreList = ignoreFile.split(/\r?\n/)
      .filter(res => !!res)
      .map(res => res.replace(/\/$/, ''))
  }
  // 将命令行 ignore 参数也加到屏蔽列表里
  ignoreList = ignoreList.concat(ignore.filter(res => !!res))
  console.log('黑名单：', ignoreList)
  return ignoreList
}

// 显示系统提示
const showMsg = msg => {
  cp.exec(`osascript -e 'display notification "${msg}" with title "监听到文件被修改了" subtitle ""'`)
}

// 监听一个文件
const watchFile = (path, interval) => {
  fs.watchFile(path, {
    interval, // 每隔多少毫秒被轮询
  }, (curr, prev) => {
    console.log('文件：', Path.resolve(path))
    console.log('修改时间：', new Date(curr.ctime).toLocaleString())
    console.log('------------------------------------')
    showMsg(
      `文件：${path}
修改时间：${new Date(curr.ctime).toLocaleString()}`);
  })
  console.log('watchfile: ', path)
}

// 遍历目录
const readdir = (dirPath, ignoreList, depth, interval) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) throw err
    if (anymatch(ignoreList, dirPath)) return
    if (!files.length) return

    // 遍历子目录
    for (let subDir of files) {
      const subPath = `${dirPath}/${subDir}` // 子目录文件路径

      if (!anymatch(ignoreList, subPath)) { // 是否在黑名单里
        fs.stat(subPath, (err, stats) => {
          if (err) throw err
          if (stats.isFile()) {
            // 如果是文件，直接监听
            watchFile(subPath, interval)
          } else if (stats.isDirectory()) {
            if (depth < 0) return // 深度到底，不继续往下监听
            readdir(subPath, ignoreList, depth - 1, interval) // 继续监听下层目录
          }
        })
      }
    }
  })
}

const fsStat = fs.stat(argv.p, (err, stats) => {
  if (err) throw err
  if (stats.isFile()) {
    if (!anymatch(argv.i, argv.p)) {
      watchFile(argv.p, argv.t)
    }
  }
  if (stats.isDirectory()) {
    readdir(argv.p, getIgnoreList(argv.p, argv.i), argv.d, argv.t)
  }
})