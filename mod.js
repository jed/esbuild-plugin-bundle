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
        metafile: true
      })

      let sourceObj = outputFiles.find(x => x.path.endsWith('.js'))
      let mapObj = outputFiles.find(x => x.path.endsWith('.js.map')) || {}
      let buffer = new TextEncoder().encode(sourceObj.contents)
      let digest = await crypto.subtle.digest('SHA-1', buffer)
      let arr = [...new Uint8Array(digest)].slice(0, 4)
      let hash = arr.map(i => i.toString(16).padStart(2, '0')).join('')
      let source = sourceObj.text
      let map = mapObj ? mapObj.text : undefined
      let contents = JSON.stringify({source, map, hash})
      let watchFiles = Object.keys(metafile.inputs)
      return {loader: 'json', contents, watchFiles}
    })
  }
}
