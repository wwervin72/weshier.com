const webpack = require('webpack')
const path = require('path')

if (process.env.CLIENT_PORT == null) {
    require('dotenv').config()
}

module.exports = {
    context: path.resolve(__dirname, '../'),
	entry: {
        index: './public/src/js/index.js',
        signIn: './public/src/js/signIn.js',
        signUp: './public/src/js/signUp.js',
        editor: './public/src/js/editor.js',
        member: './public/src/js/member.js',
        notFound: './public/src/js/notFound.js',
        422: './public/src/js/422.js',
        500: './public/src/js/500.js',
        setting: './public/src/js/setting.js',
        article: './public/src/js/article.js',
        memberTagArticleList: './public/src/js/memberTagArticleList.js'
    },
    output: {
        path: path.resolve(__dirname, '../public/dist/static/js'),
        filename: '[name].js',
        publicPath: '/js/'
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.join(__dirname, '..', 'public/src')
        }
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                loader: 'html-loader',
                options: {
                    attrs: ['img:src', 'link:href']
                }
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader?cacheDirectory=true',
                    options: {
                        "presets": [
                            ["env", {
                                "modules": false,
                                "targets": {
                                    "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
                                }
                            }],
                            "stage-2"
                        ]
                    }
                },
                include: [
                    path.join(__dirname, '../public/src'),
                    path.join(__dirname, '..', 'node_modules/webpack-dev-server/client')
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 100,
                    // 这个路径得相对于output.path来设置
                    name: '../assets/img/[name].[hash:7].[ext]'
                }
            },
            {
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: '../assets/font/[name].[hash:7].[ext]'
				}
			}
        ]
    },
    node: {
        setImmediate: false,
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
}