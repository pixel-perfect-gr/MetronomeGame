"use strict";

const path = require("path");
const baseConfig = require("@softwareventures/webpack-config");

const config = baseConfig({
    title: "Super Metronome Hero",
    entry: "./index.ts",
    vendor: "dcgw",
    html: { template: "index.html" },
    output: { publicPath: "/" },
});

config.module = config.module || {};
config.module.rules = config.module.rules || [];

config.devServer = {
    static: {
        directory: path.resolve(__dirname, "public"), // ✅ serve public folder
        publicPath: "/",
        watch: true,
    },
    port: 8080,
    client: { logging: "info" },
};

console.log("📂 Serving static files from:", path.resolve(__dirname, "public"));

module.exports = config;
