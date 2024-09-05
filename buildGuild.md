## 使用 Vite 的库模式（lib）打包

1. 打包组件代码

- src/components/MyComponent.tsx

  ```ts
  import React from "react";
  interface Props {
    name: string;
  }

  const MyComponent: React.FC<Props> = ({ name }) => {
    return <div>MyComponent {name}</div>;
  };

  export default MyComponent;
  ```

- src/index.ts

  ```ts
  export { default as MyComponent } from "./components/MyComponent";
  ```

2. vite.config

   ```ts
   export default defineConfig({
     plugins: [react()], // 使用 React 插件
     build: {
       lib: {
         entry: path.resolve(__dirname, "src/index.ts"), // 打包入口文件
         name: "my-react-component", // 包名称
         fileName: (format) => `my-react-component-${format}.js`, // 打包的文件名称
         formats: ["es"], // 输出格式，支持 ES 模块
       },
       emptyOutDir: true, // 在构建前清空输出目录
       rollupOptions: {
         external: ["react", "react-dom"], // 外部依赖，不打包这些库
         output: {
           globals: {
             react: "React", // 全局变量名
             "react-dom": "ReactDOM", // 全局变量名
           },
         },
       },
     },
   });
   ```

3. **run build** 得到 my-react-component-es.js

4. package.json

   ```json
   {
     "name": "my-react-component",
     "license": "UNLICENSED",
     "private": false,
     "description": "A react component",
     "version": "0.0.1",
     "type": "module",
     "main": "./dist/my-react-component-es.js",
     "module": "./dist/my-react-component-es.js",
     "exports": {
       ".": {
         "import": "./dist/my-react-component-es.js"
       }
     },
     "publishConfig": {
       "access": "public"
     },
     "files": ["dist"]
   }
   ```

5. 通过以上步骤打包发布后发现两个问题

   - 没有类型声明
   - 组件没有引入 css 文件，必须在使用组件的时候手动引用 css

6. 解决类型声明问题，

   - 修改 tsconfig.json

   ```json
   {
     "noEmit": false, // 允许生成文件
     "declaration": true, // 需要设置为 true 来支持类型
     "emitDeclarationOnly": true, // 只生成类型文件
     "declarationDir": "dist" // 类型文件的导出目录
   }
   ```

   - 修改 package.json

   ```json
   {
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/my-react-component-es.js",
         "types": "./dist/index.d.ts"
       }
     },
     "scripts": {
       "build": "vite build && tsc -p tsconfig.app.json"
     }
   }
   ```

7. 解决样式引用问题

   修改 viteConfig.build.rollupOptions.output

   ```json
   {
     "intro": "import \"./style.css\";" // 在输出文件开头插入样式
   }
   ```

   这种处理方式比较粗暴，直接在打包产物开头插入样式文件，适用于比较简单的组件，如果代码比较复杂，可以考虑使用 vite 插件将 css 注入到打包产物中. 例如 **vite-plugin-lib-inject-css**
