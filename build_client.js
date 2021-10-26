const fs = require('fs')
const esbuild = require('esbuild')

const _resources_src = './src/resources'
const _resources_dist = './dist'
const _resources_dist_page = _resources_dist + '/page'
const _page = 'index.html'
const _ico = 'bot.ico'

if (!fs.existsSync(_resources_dist)) {
    fs.mkdirSync(_resources_dist)
    if (!fs.existsSync(_resources_dist_page)) {
        fs.mkdirSync(_resources_dist_page)
    }
}
fs.copyFileSync(`${_resources_src}/${_page}`, `${_resources_dist_page}/${_page}`)
fs.copyFileSync(`${_resources_src}/${_ico}`, `${_resources_dist_page}/favicon.ico`)

esbuild.buildSync({
    entryPoints: ['./src/client/index.ts'],
    platform: 'browser',
    treeShaking: true,
    outfile: './dist/page/bundle.js',
    tsconfig: 'tsconfig.json',
    bundle: true
})