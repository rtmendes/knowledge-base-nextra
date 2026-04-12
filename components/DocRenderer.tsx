import { DocumentRenderer as KeystaticRenderer } from '@keystatic/core/renderer'
import type { DocumentRendererProps } from '@keystatic/core/renderer'
import { VideoEmbed } from './blocks/VideoEmbed'
import { Callout } from './blocks/Callout'
import { FileAttachment } from './blocks/FileAttachment'
import { EmbedBlock } from './blocks/EmbedBlock'

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
      }}
      renderers={{
        inline: {
          bold: ({ children }) => <strong>{children}</strong>,
          italic: ({ children }) => <em>{children}</em>,
          underline: ({ children }) => <span className="underline">{children}</span>,
          strikethrough: ({ children }) => <del>{children}</del>,
          code: ({ children }) => (
            <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono">
              {children}
            </code>
          ),
          link: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
        },
        block: {
          paragraph: ({ children, textAlign }) => (
            <p className="my-4 leading-7" style={{ textAlign }}>
              {children}
            </p>
          ),
          heading: ({ level, children, textAlign }) => {
            const base = 'font-bold tracking-tight text-gray-900 dark:text-gray-100'
            const sizes: Record<number, string> = {
              1: 'text-4xl mt-2 mb-4',
              2: 'text-3xl mt-10 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700',
              3: 'text-2xl mt-8 mb-2',
              4: 'text-xl mt-6 mb-2',
              5: 'text-lg mt-4 mb-1',
              6: 'text-base mt-4 mb-1',
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
              <ol className="my-4 ms-6 list-decimal space-y-1.5">{children}</ol>
            ) : (
              <ul className="my-4 ms-6 list-disc space-y-1.5">{children}</ul>
            ),
          'list-item': ({ children }) => (
            <li className="leading-7">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 text-gray-600 dark:text-gray-400 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, language }) => (
            <div className="my-4 overflow-x-auto">
              <pre className="rounded-xl bg-gray-900 p-4 text-sm text-gray-100 leading-6">
                <code className={language ? `language-${language}` : ''}>{children}</code>
              </pre>
            </div>
          ),
          divider: () => (
            <hr className="my-8 border-gray-200 dark:border-gray-700" />
          ),
          image: ({ src, alt, title }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ''}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700"
              />
              {title && (
                <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  {title}
                </figcaption>
              )}
            </figure>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          'table-head': ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
          ),
          'table-body': ({ children }) => <tbody>{children}</tbody>,
          'table-row': ({ children }) => (
            <tr className="border-b border-gray-200 dark:border-gray-700">{children}</tr>
          ),
          'table-cell': ({ children, header }) =>
            header ? (
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                {children}
              </th>
            ) : (
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{children}</td>
            ),
        },
      }}
    />
  )
}
