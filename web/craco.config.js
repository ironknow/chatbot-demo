const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Development optimizations for faster builds
      if (process.env.NODE_ENV === 'development') {
        // Use fast source maps for development
        webpackConfig.devtool = 'eval-cheap-module-source-map';
        
        // Disable optimizations for faster development builds
        webpackConfig.optimization = {
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };

        // Enable filesystem caching for faster rebuilds
        webpackConfig.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        };
      }

      // Configure path aliases for cleaner imports
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
      
      return webpackConfig;
    },
  },
  
  devServer: {
    hot: true,
    host: '0.0.0.0',
    compress: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  
  typescript: {
    // Disable type checking during build for faster development
    enableTypeChecking: false,
  },
};
