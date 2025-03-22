import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    /* config options here */
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            three: path.resolve("./node_modules/three"),
        };
        return config;
    },
};

export default nextConfig;
