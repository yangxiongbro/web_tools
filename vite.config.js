import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function inlineBuildAssets() {
  return {
    name: 'inline-build-assets',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlAsset = Object.values(bundle).find(
        (output) => output.type === 'asset' && output.fileName === 'index.html',
      )

      if (!htmlAsset || typeof htmlAsset.source !== 'string') {
        return
      }

      let html = htmlAsset.source

      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type === 'chunk' && output.isEntry) {
          const scriptTag = new RegExp(
            `<script\\b[^>]*\\bsrc=["'][^"']*${escapeRegExp(fileName)}["'][^>]*></script>`,
          )

          html = html.replace(
            scriptTag,
            () => `<script type="module">${output.code}</script>`,
          )
          delete bundle[fileName]
        }

        if (output.type === 'asset' && fileName.endsWith('.css')) {
          const styleTag = new RegExp(
            `<link\\b[^>]*\\bhref=["'][^"']*${escapeRegExp(fileName)}["'][^>]*>`,
          )

          html = html.replace(styleTag, () => `<style>${String(output.source)}</style>`)
          delete bundle[fileName]
        }
      }

      htmlAsset.source = html
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [vue(), inlineBuildAssets()],
  server: {
    host: '0.0.0.0',
  },
})
