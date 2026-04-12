import { DocumentRenderer as KeystaticRenderer } from '@keystatic/core/renderer'
import type { DocumentRendererProps } from '@keystatic/core/renderer'
import { VideoEmbed } from './blocks/VideoEmbed'
import { Callout } from './blocks/Callout'
import { FileAttachment } from './blocks/FileAttachment'
import { EmbedBlock } from './blocks/EmbedBlock'
import { CardGroup } from './blocks/CardGroup'
import { Steps } from './blocks/Steps'
import { RawHTML } from './blocks/RawHTML'

type Props = {
  document: DocumentRendererProps['document']
}

export function DocRenderer({ document }: Props) {
  return (
    <KeystaticRenderer
      document={document}
      componentBlocks={{
        VideoEmbed: (props) => (
          <VideoEmbed
            url={props.url as string}
            caption={props.caption as string | undefined}
            autoplay={props.autoplay as boolean | undefined}
          />
        ),
        Callout: (props) => (
          <Callout
            type={props.type as 'info' | 'warning' | 'success' | 'error' | 'note'}
            title={props.title as string | undefined}
            body={props.body as string}
          />
        ),
        FileAttachment: (props) => (
          <FileAttachment
            url={props.url as string}
            filename={props.filename as string}
            description={props.description as string | undefined}
            fileType={props.fileType as string | undefined}
          />
        ),
        EmbedBlock: (props) => (
          <EmbedBlock
            url={props.url as string}
            title={props.title as string | undefined}
            height={props.height as number | undefined}
          />
        ),
        CardGroup: (props) => (
          <CardGroup
            cols={props.cols as number | undefined}
            cards={props.cards as any[]}
          />
        ),
        Steps: (props) => (
          <Steps steps={props.steps as any[]} />
        ),
        RawHTML: (props) => (
          <RawHTML
            html={props.html as string}
            height={props.height as number | undefined}
            iframe={props.iframe as boolean | undefined}
          />
        ),
      }}
      renderers={{
        inline: {
          bold: ({ children }) => <strong className="font-semibold">{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <span className="underline">{children}</span>,
          strikethrough: ({ children }) => <del>{children}</del>,
          code: ({ children }) => (
            <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.875em] font-mono text-pink-600 dark:text-pink-400">
              {children}
            </code>
          ),
          link: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
        },
        block: {
          paragraph: ({ children, textAlign }) => (
            <p className="my-5 leading-7 text-gray-700 dark:text-gray-300" style={{ textAlign }}>
              {children}
            </p>
          ),
          heading: ({ level, children, textAlign }) => {
            const base = 'font-bold tracking-tight text-gray-900 dark:text-gray-50 scroll-mt-20'
            const sizes: Record<number, string> = {
              1: 'text-4xl mt-2 mb-5',
              2: 'text-2xl mt-10 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700',
              3: 'text-xl mt-8 mb-2',
              4: 'text-lg mt-6 mb-2',
              5: 'text-base mt-4 mb-1 font-semibold',
              6: 'text-sm mt-4 mb-1 font-semibold uppercase tracking-wide',
            }
            const Tag = `h${level}` as keyof JSX.IntrinsicElements
            return (
              <Tag className={`${base} ${sizes[level] ?? ''}`} style={{ textAlign }}>
                {children}
              </Tag>
            )
          },
          list: ({ type, children }) =>
            type === 'ordered' ? (
              <ol className="my-5 ms-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>
            ) : (
              <ul className="my-5 ms-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>
            ),
          'list-item': ({ children }) => (
            <li className="leading-7 pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-4 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/20 pl-4 pr-3 py-2 rounded-r-lg text-gray-700 dark:text-gray-300 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, language }) => (
            <div className="my-5 overflow-x-auto rounded-xl">
              {language && (
                <div className="flex items-center justify-between bg-gray-800 px-4 py-1.5 rounded-t-xl">
                  <span className="text-xs text-gray-400 font-mono">{language}</span>
                </div>
              )}
              <pre className={`bg-gray-900 p-4 text-sm text-gray-100 leading-6 overflow-x-auto ${language ? 'rounded-b-xl' : 'rounded-xl'}`}>
                <code className={language ? `language-${language}` : ''}>{children}</code>
              </pre>
            </div>
          ),
          divider: () => (
            <hr className="my-10 border-gray-200 dark:border-gray-700" />
          ),
          image: ({ src, alt, title }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ''}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              />
              {(title || alt) && (
                <figcaption className="mt-2 text-center text-sm text-gray-400 dark:text-gray-500">
                  {title || alt}
                </figcaption>
              )}
            </figure>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          'table-head': ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{children}</thead>
          ),
          'table-body': ({ children }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
          'table-row': ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{children}</tr>
          ),
          'table-cell': ({ children, header }) =>
            header ? (
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                {children}
              </th>
            ) : (
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{children}</td>
            ),
        },
      }}
    />
  )
}
