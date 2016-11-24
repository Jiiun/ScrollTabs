var webpack = require('webpack');
module.exports = {
    entry: './src/ScrollTabs.js',
    output:{
        path: './bin',
        filename: 'ScrollTabs.js'
    },
    module: {
        loaders: [{
            test: /\.css$/, 
            loader: "style-loader!css-loader"
        }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
}