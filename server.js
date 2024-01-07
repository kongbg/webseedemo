const express = require("express");
const app = express();
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); 

// 创建静态服务
const serveStatic = require("serve-static");
const rootPath = path.join(__dirname, "dist");

app.use(serveStatic(rootPath));

// 跨域
app.all("*", function (res, req, next) {
  req.header("Access-Control-Allow-Origin", "*");
  req.header("Access-Control-Allow-Headers", "Content-Type");
  req.header("Access-Control-Allow-Methods", "*");
  req.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// 启动服务
app.listen(process.env.VUE_APP_NODE_PORT, () => {
  console.log(`Server is running at http://${process.env.VUE_APP_NODE_HOST}:${process.env.VUE_APP_NODE_PORT}`);
});
