module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/public',
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: __dirname + '/public',
    },
    compress: true,
    port: 9000,
  },
};
