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
        outdir: '/'
      })

      let watchFiles = Object.keys(metafile.inputs)
      let entries = outputFiles.map(x => [x.path, x.text])
      let contents = JSON.stringify(Object.fromEntries(entries))
      return {loader: 'json', contents, watchFiles}
    })
  }
}
