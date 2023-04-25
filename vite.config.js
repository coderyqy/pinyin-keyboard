import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
const { VantResolver } = require("unplugin-vue-components/resolvers");
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8081,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  plugins: [
    vue(),
    vueJsx(),
    viteCompression({
      threshold: 124000,
    }),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/components/index.ts"),
      name: "PinyinKeyboard",
      fileName: "pinyin-keyboard",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
