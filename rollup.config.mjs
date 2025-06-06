import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import terser from '@rollup/plugin-terser';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const name = pkg.name.replace(/[^a-zA-Z0-9]/g, '_');

// 自动收集 src 下所有 ts 文件作为入口
function getAllTsFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(getAllTsFiles(fullPath));
    } else if (file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const inputFiles = getAllTsFiles('src');

// external 配置为函数，匹配所有依赖及其子路径
const externalPkgs = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];
const external = (id) => externalPkgs.some((pkgName) => id === pkgName || id.startsWith(pkgName + '/'));

export default {
  input: inputFiles,
  output: [
    {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'auto',
    },
  ],
  external,
  plugins: [resolve(), commonjs(), typescript({ declaration: false, declarationDir: undefined }) /*, terser()*/],
};
