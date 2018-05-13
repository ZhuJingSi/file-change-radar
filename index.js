#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')
const shell = require('shelljs')
const chokidar = require('chokidar')
const Path = require('path')

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
 */
/**
 * fs.watchFile(filename[, options], listener)
 * 监视 filename 文件的变化。每当文件被访问的时候都会调用listener
 * 缺点：
 * 1. 很耗资源
 * 2. 不能监听目录，需要手动逐层遍历
 */
/**
 * chokidar
 * https://github.com/paulmillr/chokidar
 * @param p string 要监听的文件或目录路径
 * @param i array 黑名单
 * @param d number 扫描深度
 * @param 
 */
// const ignoreFilePath = path.resolve('.watch-ignore')
const watch = (p, i, d, t) => {
  console.log('t ', t)
  let ignoreFile
  let ignoreList = []
  try {
    // 读取 ignore 文件
    ignoreFile = fs.readFileSync(Path.resolve(p, '.watch-ignore'), 'utf8')
  } catch (err) {}
  if (ignoreFile) {
    // 将文件按行拆成数组
    ignoreList = ignoreFile.split(/\r?\n/)
      .filter(res => !!res)
      .map(res => res.replace(/\/$/, ''))
  }
  // 将命令行 ignore 参数也加到屏蔽列表里
  ignoreList = ignoreList.concat(i.filter(res => !!res))
  console.log('ignoreList ', ignoreList)
  // 监听配置
  const watcher = chokidar.watch(p, {
      ignored: ignoreList, // 不监听的文件列表
      ignoreInitial: true, // 忽略监听初始实例化时的 add/addDir 事件
      // persistent: false, // 是否放在前台监听（进程不跳出）
      // cwd: '.', // 基础路径
      ignorePermissionErrors: true, // 对于不允许读的文件，监听失败时不报错
      depth: d, // 扫描深度
      usePolling: true, // 是否使用 fs.watchFile
      interval: t, // 扫面间隔时间，单位 ms
    })
    .on('change', (path, stats) => {
      console.log('文件：', Path.resolve(path))
      // usePolling 设置为 true 才有 stats
      if (stats) {
        console.log('修改时间：', new Date(stats.ctime).toLocaleString())
      }
    })
}

const watchFile = path => {
  console.log('watchFile', path)
}

const watchDirectory = path => {
  console.log('watchDirectory', path)
}

const fsStat = fs.stat(argv.p, (err, stats) => {
  if (err) throw err
  // if (stats.isFile()) watchFile(argv.p)
  // if (stats.isDirectory()) watchDirectory(argv.p)
  watch(argv.p, argv.i, argv.d, argv.t)
})

// console.log('shell', shell)
// shell.echo('fsStat ' + fsStat)