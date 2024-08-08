// webpack 配置自定义

module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    /**
     * assets is referencing some external resources
     * no need to bundle them
     */
    if (process.env.NODE_ENV === 'production') {
      const preExternals = config.toConfig().externals
      config.externals({
        ...preExternals,
        lodash: 'var window._',
        moment: 'var window.moment',
        '@ant-design/icons': 'var window.icons',
        antd: 'var window.antd',
      })
    }
    if (process.env.NODE_ENV === 'development') {
      const preExternals = config.toConfig().externals
      delete preExternals['antd']
      delete preExternals['@ant-design/icons']
      config.externals({
        ...preExternals,
      })
    }
  })
}
