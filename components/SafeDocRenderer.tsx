/* eslint-disable @next/next/no-img-element */
/**
 * SafeDocRenderer — a crash-proof document renderer for Keystatic content.
 *
 * Replaces KeystaticRenderer because the official renderer throws on
 * unknown inline node types (e.g. inline images in imported genspark
 * content). This renderer handles every node type gracefully.
 */
import React from 'react'

type DocNode = Record<string, any>

// ── Inline rendering ──────────────────────────────────────────────────────

function renderInline(node: DocNode, key: number): React.ReactNode {
  if (!node || typeof node !== 'object') return null

  // Pure text node (possibly with marks)
  if ('text' in node && typeof node.text === 'string') {
    let el: React.ReactNode = node.text
    if (node.bold) el = <strong key={key} className="font-semibold">{el}</strong>
    if (node.italic) el = <em key={key}>{el}</em>
    if (node.underline) el = <span key={key} className="underline">{el}</span>
    if (node.strikethrough) el = <del key={key}>{el}</del>
    if (node.code) el = (
      <code key={key} className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.875em] font-mono text-pink-600 dark:text-pink-400">
        {el}
      </code>
    )
    if (node.keyboard) el = <kbd key={key} className="rounded border bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm">{el}</kbd>
    if (node.superscript) el = <sup key={key}>{el}</sup>
    if (node.subscript) el = <sub key={key}>{el}</sub>
    return el
  }

  // Typed inline nodes
  switch (node.type) {
    case 'link':
      return (
        <a
          key={key}
          href={node.href}
          className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
          target={node.href?.startsWith('http') ? '_blank' : undefined}
          rel={node.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {renderInlines(node.children)}
        </a>
      )

    case 'image':
      return (
        <img
          key={key}
          src={node.src}
          alt={node.alt || ''}
          title={node.title || undefined}
          className="inline-block max-h-80 rounded border border-gray-200 dark:border-gray-700"
        />
      )

    default:
      // Unknown inline — render children or text fallback
      if (node.children && Array.isArray(node.children)) {
        return <span key={key}>{renderInlines(node.children)}</span>
      }
      return <span key={key}>{node.text || node.alt || ''}</span>
  }
}

function renderInlines(children?: DocNode[]): React.ReactNode {
  if (!children || !Array.isArray(children)) return null
  return children.map((child, i) => renderInline(child, i))
}

// ── Block rendering ───────────────────────────────────────────────────────

function renderBlock(node: DocNode, key: number): React.ReactNode {
  if (!node || typeof node !== 'object') return null

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="my-5 leading-7 text-gray-700 dark:text-gray-300" style={node.textAlign ? { textAlign: node.textAlign } : undefined}>
          {renderInlines(node.children)}
        </p>
      )

    case 'heading': {
      const level = node.level || 2
      const Tag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements
      const sizes: Record<number, string> = {
        1: 'text-4xl mt-2 mb-5',
        2: 'text-2xl mt-10 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700',
        3: 'text-xl mt-8 mb-2',
        4: 'text-lg mt-6 mb-2',
        5: 'text-base mt-4 mb-1 font-semibold',
        6: 'text-sm mt-4 mb-1 font-semibold uppercase tracking-wide',
      }
      return (
        <Tag key={key} className={`font-bold tracking-tight text-gray-900 dark:text-gray-50 scroll-mt-20 ${sizes[level] || ''}`}>
          {renderInlines(node.children)}
        </Tag>
      )
    }

    case 'ordered-list':
      return (
        <ol key={key} className="my-5 ms-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300">
          {renderBlocks(node.children)}
        </ol>
      )

    case 'unordered-list':
      return (
        <ul key={key} className="my-5 ms-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
          {renderBlocks(node.children)}
        </ul>
      )

    case 'list-item':
      return <li key={key} className="leading-7 pl-1">{renderBlocks(node.children)}</li>

    case 'list-item-content':
      // Direct inline content inside a list item — render inline, no wrapper
      return <React.Fragment key={key}>{renderInlines(node.children)}</React.Fragment>

    case 'blockquote':
      return (
        <blockquote key={key} className="my-5 border-l-4 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/20 pl-4 pr-3 py-2 rounded-r-lg text-gray-700 dark:text-gray-300 italic">
          {renderBlocks(node.children)}
        </blockquote>
      )

    case 'code': {
      const lang = node.language || ''
      const codeText = node.children?.map((c: DocNode) => c.text || '').join('') || ''
      return (
        <div key={key} className="my-5 overflow-x-auto rounded-xl">
          {lang && (
            <div className="flex items-center justify-between bg-gray-800 px-4 py-1.5 rounded-t-xl">
              <span className="text-xs text-gray-400 font-mono">{lang}</span>
            </div>
          )}
          <pre className={`bg-gray-900 p-4 text-sm text-gray-100 leading-6 overflow-x-auto ${lang ? 'rounded-b-xl' : 'rounded-xl'}`}>
            <code className={lang ? `language-${lang}` : ''}>{codeText}</code>
          </pre>
        </div>
      )
    }

    case 'divider':
      return <hr key={key} className="my-10 border-gray-200 dark:border-gray-700" />

    case 'image':
      return (
        <figure key={key} className="my-6">
          <img
            src={node.src}
            alt={node.alt || ''}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          />
          {(node.title || node.alt) && (
            <figcaption className="mt-2 text-center text-sm text-gray-400 dark:text-gray-500">
              {node.title || node.alt}
            </figcaption>
          )}
        </figure>
      )

    case 'table':
      return (
        <div key={key} className="my-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse text-sm">
            {renderBlocks(node.children)}
          </table>
        </div>
      )

    case 'table-head':
      return <thead key={key} className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{renderBlocks(node.children)}</thead>

    case 'table-body':
      return <tbody key={key} className="divide-y divide-gray-200 dark:divide-gray-700">{renderBlocks(node.children)}</tbody>

    case 'table-row':
      return <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{renderBlocks(node.children)}</tr>

    case 'table-cell':
      return node.header
        ? <th key={key} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">{renderInlines(node.children)}</th>
        : <td key={key} className="px-4 py-3 text-gray-600 dark:text-gray-400">{renderInlines(node.children)}</td>

    case 'layout':
      return (
        <div key={key} className="my-5 grid gap-4" style={{ gridTemplateColumns: (node.layout || []).map((n: number) => `${n}fr`).join(' ') }}>
          {renderBlocks(node.children)}
        </div>
      )

    case 'layout-area':
      return <div key={key}>{renderBlocks(node.children)}</div>

    case 'component-block':
      // Render component block children or show placeholder
      if (node.children && Array.isArray(node.children)) {
        return <div key={key} className="my-5">{renderBlocks(node.children)}</div>
      }
      return <div key={key} className="my-5 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500">[{node.component || 'component'}]</div>

    default:
      // Unknown block type — render children or ignore
      if (node.children && Array.isArray(node.children)) {
        return <div key={key}>{renderBlocks(node.children)}</div>
      }
      return null
  }
}

function renderBlocks(children?: DocNode[]): React.ReactNode {
  if (!children || !Array.isArray(children)) return null
  return children.map((child, i) => renderBlock(child, i))
}

// ── Public component ──────────────────────────────────────────────────────

type Props = {
  document: DocNode[]
}

export function SafeDocRenderer({ document }: Props) {
  if (!document || !Array.isArray(document)) return null
  return <>{renderBlocks(document)}</>
}
