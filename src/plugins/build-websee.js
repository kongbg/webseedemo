const fs = require("fs-extra");
const path = require("path");
class BuildWebSee {
  /**
   * 初始化BuildWebSee
   * @param {String} options.token 项目唯一token 必填
   * @param {String} options.dsn sourceMap上传地址 必填
   * @param {String} options.appVersion wen应用版本(package.json'中的version) 必填
   * @param {String} options.productionSourceMap 生产环境是否保留sourceMap 必填 作用同webpack中的productionSourceMap，想要上传sourcemap到WebSeeUpLoadMap,webpack的productionSourceMap必须为true，WebSeeUpLoadMap中的productionSourceMap为true时，dist目录保留map文件，反之不保留
   * @param {Array}  options.uploadScript 需要上传sourceMap的命令 可选 默认值为['vue-cli-service build']，其他命令需要上传sourceMap的话，加入数组即可
   * @param {String} options.name 项目名称 可选
   */
  constructor(options) {}
  apply(compiler) {
    compiler.hooks.afterEmit.tap("BuildWebSee", async (compilation, next) => {
      const sourcePaths = [
        path.resolve(__dirname, "dist", "css"),
        path.resolve(__dirname, "dist", "fonts"),
        path.resolve(__dirname, "dist", "img"),
        path.resolve(__dirname, "dist", "js"),
        path.resolve(__dirname, "dist", "favicon.ico"),
        path.resolve(__dirname, "dist", "index.html"),
        path.resolve(__dirname, "./", "server.js"),
        path.resolve(__dirname, "./", ".env.production"),
      ];

      const targetPath = path.resolve(__dirname, "dest");
      sourcePaths.forEach((sourcePath) => {
        try {
          fs.copySync(sourcePath, targetPath);
          console.log(`${sourcePath} copied successfully!`);

          // 删除源文件夹
          fs.removeSync(sourcePath);
          console.log(`Source folder ${sourcePath} removed successfully!`);
        } catch (err) {
          console.error(`Error copying ${sourcePath}:`, err);
        }
      });
    });
  }
}

module.exports = BuildWebSee;
