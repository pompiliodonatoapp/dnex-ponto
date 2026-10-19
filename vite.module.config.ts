import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
// Host supplies DS, React and utilities by scanning the module artifact.
const externals=['react','react-dom','@dnex/ds','@dnex/workspace-shell'];
export default defineConfig({
  plugins:[react(),{name:'ponto-module-contract',closeBundle(){
    copyFileSync(resolve('src/module/public.d.ts'),resolve('dist-module/index.d.ts'));
    writeFileSync(resolve('dist-module/package.json'),JSON.stringify({name:'@dnex/ponto-client',version:'0.2.0',private:true,type:'module'},null,2)+'\n');
  }}],
  envDir:resolve('src/module'),envPrefix:'DNEX_PONTO_MODULE_UNUSED_',
  build:{outDir:'dist-module',emptyOutDir:true,minify:false,sourcemap:false,copyPublicDir:false,cssCodeSplit:false,
    lib:{entry:resolve('src/module/index.tsx'),formats:['es'],fileName:()=> 'ponto-module.js',cssFileName:'ponto-module'},
    rollupOptions:{external:id=>externals.some(name=>id===name||id.startsWith(name+'/')),output:{assetFileNames:'[name][extname]'}}
  }
});
