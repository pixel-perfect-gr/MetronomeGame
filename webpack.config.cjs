"use strict";

const baseConfig = require("@softwareventures/webpack-config");

module.exports = baseConfig({
    title: "Super Metronome Hero",
    entry: "./index.ts", // ✅ your main file
    vendor: "dcgw",

    html: {
        template: "index.html"
    },

    webpack: (webpackConfig) => {
        // ✅ Ensure Webpack knows about fonts
        webpackConfig.module.rules.push({
            test: /\.(woff2?|eot|ttf|otf)$/i,
            type: "asset/resource",
            generator: {
                filename: "fonts/[name][ext]"
            }
        });

        // ✅ Also tell Webpack to handle TypeScript
        webpackConfig.module.rules.push({
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        });

        webpackConfig.resolve.extensions = [".ts", ".tsx", ".js"];

        return webpackConfig;
    }
});
