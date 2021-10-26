const esbuild = require('esbuild')

esbuild.buildSync({
    entryPoints: ['./src/server/index.ts'],
    platform: 'node',
    treeShaking: true,
    outfile: './dist/server.js',
    tsconfig: 'tsconfig.json',
    bundle: true
})