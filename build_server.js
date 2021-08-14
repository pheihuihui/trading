const esbuild = require('esbuild')

esbuild.buildSync({
    entryPoints: ['./src/server.ts'],
    platform: 'node',
    treeShaking: 'ignore-annotations',
    outfile: './dist_server/server.js',
    tsconfig: 'tsconfig.json',
    bundle: true
})