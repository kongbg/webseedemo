const { defineConfig } = require('@vue/cli-service');
// const WebSeeSourceMap = require('./src/plugins/web-see-upload-map.js');
// const WebSeeSourceMap = require('websee-sourcemaps');
const port = process.env.VUE_APP_NODE_PORT;
process.env.VUE_APP_VERSION = require('./package.json').version;
module.exports = defineConfig({
  productionSourceMap: true,// true生产环境生成sourceMap文件
  configureWebpack: {
    // plugins: [
    //   new WebSeeSourceMap({
    //     name: process.env.WEBSEE_NAME,
    //     token: process.env.VUE_APP_WEBSEE_TOKEN,
    //     dsn: process.env.VUE_APP_WEBSEE_DSN,
    //     appVersion: process.env.VUE_APP_VERSION,
    //     productionSourceMap: process.env.WEBSEE_SOURCEMAP,
    //     uploadScript: []
    //   })
    // ],
  },
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  devServer: {
    port: process.env.VUE_PORT,
    proxy: {
      '/api': {
        target: `http://${process.env.VUE_APP_NODE_HOST}:${port}/`,
        changeOrigin: false,
        secure: false,
        // pathRewrite: {
        //   ['/api']: '',
        // },
      }
    }
  }
})
