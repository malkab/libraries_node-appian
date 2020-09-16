const path = require('path');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

module.exports = {
  entry: {
    index: "./src/index.ts",
    main: "./test/main.ts"
  },
  mode: process.env.NODE_ENV === "production" ?
    "production" : "development",
  watch: true,
  target: "node",
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './build'
  },
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  },

  output: {
    path: path.resolve(__dirname),
    filename: './build/[name].js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true
            }
          }
        ],
        exclude: "/node_modules/"
      }
    ]
  },

  node: {
    fs: "empty"
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },

  plugins: [
    new FilterWarningsPlugin({
      exclude: /Critical dependency: the request of a dependency is an expression/
    })
  ]

};
