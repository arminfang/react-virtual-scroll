import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), libInjectCss(), svgr()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "ReactVirtualScroll",
      fileName: (format) => `react-virtual-scroll.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      plugins: [],
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: [{ find: "src", replacement: path.resolve(__dirname, "src") }],
  },
});
