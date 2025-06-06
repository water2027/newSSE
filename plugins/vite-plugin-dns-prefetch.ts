import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup'
import type { Plugin } from 'vite'

interface DnsPrefetchOptions {
  maxLinks?: number
  exclude?: string[]
  include?: string[]
}

export function dnsPrefetchPlugin(options: DnsPrefetchOptions = {}): Plugin {
  const { maxLinks = 10, exclude = [], include = [] } = options
  const extractedDomains = new Set<string>()

  return {
    name: 'vite-plugin-dns-prefetch',
    apply: 'build',

    generateBundle(opts, bundle: OutputBundle) {
      const urlRegex = /https?:\/\/([^/\s"']+)/gi

      Object.values(bundle).forEach((file) => {
        let content = ''

        if (file.type === 'asset') {
          const asset = file as OutputAsset
          if (typeof asset.source === 'string') {
            content = asset.source
          }
          else if (asset.source instanceof Uint8Array) {
            content = new TextDecoder().decode(asset.source)
          }
        }
        else if (file.type === 'chunk') {
          const chunk = file as OutputChunk
          content = chunk.code
        }

        const matches = content.matchAll(urlRegex)
        for (const match of matches) {
          const domain = match[1]

          if (include.length > 0 && !include.some(pattern => domain.includes(pattern))) {
            continue
          }

          if (exclude.some(pattern => domain.includes(pattern))) {
            continue
          }

          extractedDomains.add(domain)

          if (extractedDomains.size >= maxLinks) {
            break
          }
        }
        // let match : RegExpExecArray | null;
        // while ((match = urlRegex.exec(content)) !== null) {
        //   const domain = match[1]

        //   if (include.length > 0 && !include.some(pattern => domain.includes(pattern))) {
        //     continue
        //   }

        //   if (exclude.some(pattern => domain.includes(pattern))) {
        //     continue
        //   }

        //   extractedDomains.add(domain)

        //   if (extractedDomains.size >= maxLinks) {
        //     break
        //   }
        // }
      })
    },

    transformIndexHtml: {
      order: 'post',
      handler(html: string) {
        if (extractedDomains.size === 0) {
          return html
        }

        const dnsPrefetchTags = Array.from(extractedDomains)
          .slice(0, maxLinks)
          .map(domain => `    <link rel="dns-prefetch" href="//${domain}">`)
          .join('\n')

        // 在head标签结束前插入DNS预解析标签
        const headEndIndex = html.indexOf('</head>')
        if (headEndIndex !== -1) {
          const modifiedHtml = `${html.slice(0, headEndIndex)
            + dnsPrefetchTags}\n${
            html.slice(headEndIndex)}`

          return modifiedHtml
        }

        return html
      },
    },
  }
}

export default dnsPrefetchPlugin
