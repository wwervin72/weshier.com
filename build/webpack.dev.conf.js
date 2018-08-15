const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const webpackConf = require('./webpack.base.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const packageConfig = require('../package.json')

createNotifierCallback = () => {
    const notifier = require('node-notifier')
    return (severity, errors) => {
        if (severity !== 'error') return
        const error = errors[0]
        const filename = error.file && error.file.split('!').pop()
        notifier.notify({
            title: packageConfig.name,
            message: severity + ': ' + error.name,
            subtitle: filename || '',
            icon: path.join(__dirname, 'logo.png')
        })
    }
}

module.exports = merge(webpackConf, {
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
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
                ]
            }
        ]
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        clientLogLevel: 'warning',
		hot: false,
		contentBase: false,
		compress: true,
		host: process.env.CLIENT_HOST,
		port: process.env.CLIENT_PORT,
        open: false,
        overlay: {
            warnings: false, 
            errors: false 
        },
		publicPath: '/',
		proxy: {},
		quiet: true,
		watchOptions: {
			poll: false,
		}
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new FriendlyErrorsPlugin({
            compilationSuccessInfo: {
              messages: [`client application is running here: http://${process.env.CLIENT_HOST || '0.0.0.0'}:${process.env.CLIENT_PORT || 3333}`],
            },
            onErrors: createNotifierCallback()
        })
    ]
})
