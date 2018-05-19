利用 Node js 写的一个对文件或目录的扫描文件修改，一旦修改抛出系统提示。

### native-api、use-chokidar

native-api、use-chokidar 两个目录实现的功能是一样的，实现方式不一样，一个用 node 原生 api，一个用 chokidar 库。native-api 的提示使用 `osascript` 桌面通知。

### Getting started

1.  下载这个包
2.  cd 到这个包
3.  ```
    // 安装依赖
    npm i
    // 这个操作可选，是为了使用时不用定位到该目录的 index 文件，直接使用 fileWatch 就好
    npm link
    ```

### Config

**--version** 显示版本号 [布尔]

**-p, --path** 要监听的文件或目录路径 [字符串][默认值: "."]

**-i, --ignore** 黑名单 [数组]默认值: []]

**-d, --depth** 扫描深度，如：0 即只监听当前目录下的文件 [数字]

**-t, --inteval** 扫描间隔时间，单位 ms [数字][默认值: 100]

**-h, --help** 显示帮助信息 [布尔]

_注意：_ 还可在要监听的目录下新建 `.watch-ignore` 文件，用来配置不需要监听的文件/目录黑名单。若同时设置了 -i 参数，将与 `.watch-ignore` 合并生效。格式同 `.gitignore`。
