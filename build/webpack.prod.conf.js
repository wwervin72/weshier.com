const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const webpackConf = require('./webpack.base.conf')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(webpackConf, {
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                config: {
                                    path: './postcss.config.js'
                                },
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: Object.assign({},
                                {
                                    sourceMap: true
                            
                                }
                            )
                        }
                    ],
                    fallback: 'style-loader'
                })
            }
        ]
    },
    devtool: '#source-map',
    plugins: [
         new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: 'production'
          }
        }),
        new ExtractTextPlugin({
            filename: '../css/[name].css',
            allChunks: true,
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: { 
                safe: true, 
                autoprefixer: false,
                map: { 
                    inline: false 
                }
            }
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            sourceMap: true,
            parallel: true
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/index.html'),
            template: path.join(__dirname, '../public/src/pages/index.html'),
            inject: true,
            chunks: ['index'],
            minify: {
                // removeComments: true,
                // collapseWhitespace: true,
                // removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/header.html'),
            template: path.join(__dirname, '../public/src/pages/header.html'),
            inject: false,
            minify: {
                // removeComments: true,
                // collapseWhitespace: true,
                // removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/articleList.html'),
            template: path.join(__dirname, '../public/src/pages/articleList.html'),
            inject: false,
            minify: {
                // removeComments: true,
                // collapseWhitespace: true,
                // removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/signIn.html'),
            template: path.join(__dirname, '../public/src/pages/signIn.html'),
            inject: true,
            chunks: ['signIn'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/signUp.html'),
            template: path.join(__dirname, '../public/src/pages/signUp.html'),
            inject: true,
            chunks: ['signUp'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/editor.html'),
            template: path.join(__dirname, '../public/src/pages/editor.html'),
            inject: true,
            chunks: ['editor'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/member.html'),
            template: path.join(__dirname, '../public/src/pages/member.html'),
            inject: true,
            chunks: ['member'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/notFound.html'),
            template: path.join(__dirname, '../public/src/pages/notFound.html'),
            inject: true,
            chunks: ['notFound'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/setting.html'),
            template: path.join(__dirname, '../public/src/pages/setting.html'),
            inject: true,
            chunks: ['setting'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/article.html'),
            template: path.join(__dirname, '../public/src/pages/article.html'),
            inject: true,
            chunks: ['article'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/sideTool.html'),
            template: path.join(__dirname, '../public/src/pages/sideTool.html'),
            inject: false,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/500.html'),
            template: path.join(__dirname, '../public/src/pages/500.html'),
            inject: true,
            chunks: ['500'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/422.html'),
            template: path.join(__dirname, '../public/src/pages/422.html'),
            inject: true,
            chunks: ['422'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, '../public/dist/pages/memberTagArticleList.html'),
            template: path.join(__dirname, '../public/src/pages/memberTagArticleList.html'),
            inject: true,
            chunks: ['memberTagArticleList'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        // copy custom static assets
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '../public/src/lib/'),
				to: path.resolve(__dirname, '../public/dist/static/lib/'),
				ignore: ['.*']
			}
		])
    ]
})
