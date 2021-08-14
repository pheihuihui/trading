const esbuild = require('esbuild')

esbuild.buildSync({
    entryPoints: ['./src/server.ts'],
    platform: 'node',
    treeShaking: 'ignore-annotations',
    outfile: './dist/server.js',
    tsconfig: 'tsconfig.json',
    bundle: true
})