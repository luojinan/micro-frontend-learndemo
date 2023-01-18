## 微前端demo
以 vite + 原生html/js 为宿主应用搭建微前端框架

以 webpack5 + vue2.7 为子应用

仿照qiankun的简易微前端框架
qiankun又是基于single-spa
所以本demo和`qiankun`、`single-spa`会很像

目前不支持子应用使用 vite 打包工具，因为是读取子应用 html 直接注入主应用容器的

而vite开发阶段dev用的是esm，并且dev拦截资源按需编译，主应用中本地不会启动子应用？


TODO: microCore 实现现在市面上多种微前端方案, 通过不同的入口文件暴露出来使用

- qiankun/single-spa 阿里
- micor-app 京东零售
- 无界
- iframe - 携程
