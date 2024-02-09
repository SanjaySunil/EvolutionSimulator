const webpack = require("webpack");
const path = require("path");
const process = require("process");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const ifProd = (x) => isProd && x;
const removeEmpty = (arr) => arr.filter(Boolean);

module.exports = {
  entry: "./src/main.ts",
  devtool: isProd ? false : "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    noEmitOnErrors: true,
    minimizer: removeEmpty([
      ifProd(
        new UglifyJsPlugin({
          sourceMap: true,
        })
      ),
    ]),
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
  plugins: [
    // ... other plugins
    ifProd(
      new webpack.SourceMapDevToolPlugin({
        // this is the url of our local sourcemap server
        publicPath: "https://localhost:5050/",
        filename: "[file].map",
      })
    ),
  ],
};
