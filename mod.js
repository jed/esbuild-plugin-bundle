export default {
  name: 'bundle',

  setup: ({initialOptions, onResolve, onLoad, esbuild}) => {
    onResolve({filter: /[?&]bundle\b/}, ({path, importer}) => {
      let {pathname} = new URL(path, `file://${importer}`)
      return {namespace: 'bundle', path: pathname}
    })

    onLoad({filter: /.*/, namespace: 'bundle'}, async ({path}) => {
      let {outputFiles, metafile} = await esbuild.build({
        ...initialOptions,
        entryPoints: [path],
        bundle: true,
        write: false,
        metafile: true,
        outdir: '/',
        outfile: undefined
      })

      let watchFiles = Object.keys(metafile.inputs)
      let entries = outputFiles.map(x => [x.path, x.text])
      let source = entries.find(x => x[0].endsWith('.js'))?.[1]
      let map = entries.find(x => x[0].endsWith('.js.map'))?.[1]

      let contents =
        `export default ${JSON.stringify(Object.fromEntries(entries))};` +
        `export const source=${JSON.stringify(source)};` +
        `export const map=${JSON.stringify(map)};`

      return {loader: 'js', contents, watchFiles}
    })
  }
}
