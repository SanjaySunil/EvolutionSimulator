module.exports = {
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: __dirname + "/public",
    filename: "./js/index.js",
  },
  devServer: {
    static: {
      directory: __dirname + "/public",
    },
    compress: true,
    port: 8080,
    hot: true,
  },
};
