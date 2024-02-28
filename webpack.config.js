module.exports = {
  entry: "./src/main.ts",
  devtool: "false",
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
    filename: "./js/main.js",
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
