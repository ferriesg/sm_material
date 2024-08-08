const { name, version } = require('./package.json')

const library = 'SMMaterials'

module.exports = {
  sourceMap: false,
  alias: {
    '@': './src',
    lowcode: './lowcode',
  },
  plugins: [
    [
      '@alifd/build-plugin-lowcode',
      {
        noParse: true,
        engineScope: '@alilc',
        library,
        npmInfo: {
          package: name,
          version,
        },
        lowcodeDir: 'lowcode',
        entryPath: 'src/index.tsx',
        categories: [],
        builtinAssets: [
          {
            packages: [
              {
                package: 'moment',
                version: '2.24.0',
                urls: ['https://cdn.redhare.cc/moment@2.29.4/min/moment.min.js'],
                library: 'moment',
              },
              {
                package: 'lodash',
                library: '_',
                urls: ['https://cdn.redhare.cc/lodash@4.17.21/lodash.min.js'],
              },
              {
                package: 'antd',
                version: '4.24.14',
                urls: [
                  'https://cdn.redhare.cc/antd@4.24.14/dist/antd.min.js',
                  'https://cdn.redhare.cc/antd@4.24.14/dist/antd.min.css',
                ],
                library: 'antd',
              },
            ],
            components: [],
          },
        ],
        // TODO: add groupList & categoryList
      },
    ],
    [
      '@alilc/build-plugin-alt',
      {
        type: 'component',
        inject: true,
        library,
        // 配置要打开的页面，在注入调试模式下，不配置此项的话不会打开浏览器
        // 支持直接使用官方 demo 项目：https://lowcode-engine.cn/demo/index.html
        // openUrl: 'https://lowcode-engine.cn/demo/index.html?debug',
        openUrl: 'http://localhost:5552/',
      },
    ],
    './build.plugin.js',
  ],
}
