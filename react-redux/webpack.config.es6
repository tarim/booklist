var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var path = require('path');
var webpack = require('webpack');
var noVisualization = process.env.NODE_ENV === 'production' 
        || process.argv.slice(-1)[0] == '-p'
        || process.argv.some(arg => arg.indexOf('webpack-dev-server') >= 0);

const asyncBundle = (name, {nodePaths = [], resources = []}) => 
    new webpack.optimize.CommonsChunkPlugin({
        async: name,
        minChunks({context, resource}, count) {
            return (context && context.indexOf('node_modules') >= 0 && nodePaths.find(t => new RegExp('\\\\' + t + '\\\\', 'i').test(context)))
                    ||
                   (resource && resources.find(r => !path.relative(r + '.js', resource)))
        }
    })

module.exports = {
    entry: {
        main: './reactStartup.js'
    },
    output: {
        filename: '[name]-bundle.js',
        chunkFilename: '[name]-chunk.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist/'
    },
    resolve: {
        alias: {
            'jscolor': 'util/jscolor.js'
        },
        modules: [
            path.resolve('./'),
            path.resolve('./node_modules'),
        ]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015-webpack', 'stage-1', 'stage-2'],
                    plugins: ['transform-decorators-legacy', 'external-helpers']
                }
            }
        ]
    },
    plugins: [
        (!noVisualization ? 
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                generateStatsFile: true
            }) : null),

        new webpack.optimize.CommonsChunkPlugin({
            async: 'react-build',
            minChunks(module, count) {
                var context = module.context;
                return context && (context.indexOf('node_modules\\react\\') >= 0 || context.indexOf('node_modules\\react-dom\\') >= 0);
            },
        }),

        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'manifest'
        // }),        

        //*********************************** async chunks*************************

        //catch all - anything used in more than one place
        new webpack.optimize.CommonsChunkPlugin({
            async: 'used-twice',
            minChunks: (module, count) => count >= 2,
        }),

        asyncBundle('react-dnd', { nodePaths: ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend', 'dnd-core']  }),
        asyncBundle('book-modal-helpers', { 
            resources: [
                'applicationRoot/components/genericLabelSelect', 
                'applicationRoot/components/customColorPicker', 
                'util/jscolor'
            ], 
            nodePaths: ['react-autosuggest', 'react-autowhatever'] 
        }),

        asyncBundle('XXXXXX', { 
            resources: [
                'applicationRoot/components/bootstrapButton'
            ]
        })

    ].filter(p => p),
    devServer: {
        proxy: {
            "/": "http://localhost:3000",
            "/react-redux/login": "http://localhost:3000",
            "/react-redux/logout": "http://localhost:3000",
            "/react-redux/createUser": "http://localhost:3000",
            "/react-redux/static": "http://localhost:3000",
            "/subject": "http://localhost:3000",
            "/tag": "http://localhost:3000",
            "/book": "http://localhost:3000",
            "/user": "http://localhost:3000",
            "/static": "http://localhost:3000",
            "/react-redux/util": "http://localhost:3000",
            "/react-redux/logout": "http://localhost:3000"
        }
    }
};