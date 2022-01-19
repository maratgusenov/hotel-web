const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require('fs')

const isDev = process.env.NODE_ENV === "development"
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

if (mode = isProd) {
  mode = "production"
} else if (mode = isDev) {
  mode = "development"
}
console.log(mode + " mode")

let entryName = {};

function entryPoints(page) {
  entryName[page] = `./pages/${page}`;
}

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./dist"),
}

const PAGES_DIR = `${PATHS.src}/ui-kit/`
const PAGES = fs
  .readdirSync(PAGES_DIR);

const plugins = () => {
  const base = [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: `${PATHS.src}/assets/img`,
          to: `${PATHS.dist}/img`,
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
    ...PAGES.map((page) => {
      entryPoints(page);
      return new HTMLWebpackPlugin({
        template: `./ui-kit/${page}/${page}.pug`,
        filename: `./${page}.html`,
        chunks: [`${page}`],
      });
    }),
  ]

  return base;
};

module.exports = {
  context: PATHS.src,
  mode: mode,
  entry: {
    main: ["@babel/polyfill", "./index.js"],
  },
  output: {
    filename: filename("js"),
    path: PATHS.dist,
    assetModuleFilename: "assets/[hash][ext][query]",
  },
  devServer: {
    port: 8050,
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    },
  },
  plugins: plugins(),
  module: {
    rules:
      [
        {
          test: /\.html$/i,
          loader: "html-loader",
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            (isDev) ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "postcss-preset-env",
                      {
                        // Options
                      },
                    ],
                  ],
                },
              },
            },
            "sass-loader",
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.xml$/,
          type: "asset/resource",
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        },
        {
          test: /\.pug$/,
          use: "pug-loader",
        },
      ],
  },
}