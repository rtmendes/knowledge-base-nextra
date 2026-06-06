/**
 * Sanitize a Keystatic document tree to handle unsupported inline node types.
 *
 * Some imported content (Genspark, Claude) contains inline images, which
 * Keystatic\'s DocumentRenderer does not support. This utility converts
 * them to block-level images (splitting paragraphs if needed) or falls
 * back to text placeholders for any other unknown inline types.
 */

type DocNode = Record<string, any>

const KNOWN_INLINE_MARKS = new Set([
  'bold', 'italic', 'underline', 'strikethrough',
  'code', 'keyboard', 'subscript', 'superscript',
])

function isTextNode(node: DocNode): boolean {
  return 'text' in node && typeof node.text === 'string'
}

function isKnownInline(node: DocNode): boolean {
  if (isTextNode(node)) return true
  if (node.type === 'link') return true
  // Marks are applied as boolean flags on text nodes
  return Object.keys(node).some(k => KNOWN_INLINE_MARKS.has(k))
}

/** Recursively sanitize inline nodes, converting unknown types to text */
function sanitizeInline(node: DocNode): DocNode {
  if (isTextNode(node)) return node

  // Unknown inline type (e.g. image inside a paragraph)
  if (node.type && !isKnownInline(node)) {
    if (node.type === 'image') {
      // Will be hoisted to block level by sanitizeBlock
      return node
    }
    // Convert any other unknown inline type to a text placeholder
    return { text: node.alt || node.text || `[${node.type}]` }
  }

  // Recurse into children (e.g. link children)
  if (node.children && Array.isArray(node.children)) {
    return { ...node, children: node.children.map(sanitizeInline) }
  }

  return node
}

/** Sanitize a block node — may return multiple blocks if inline images are hoisted */
function sanitizeBlock(block: DocNode): DocNode[] {
  if (!block || typeof block !== 'object') return [block]

  // For blocks with children (paragraphs, headings, list items, etc.)
  if (block.children && Array.isArray(block.children)) {
    // Check if any child is an inline image
    const hasInlineImage = block.children.some(
      (c: DocNode) => c.type === 'image'
    )

    if (hasInlineImage) {
      // Split: hoist images out as block-level, keep text in original block type
      const result: DocNode[] = []
      let textBuffer: DocNode[] = []

      const flushText = () => {
        if (textBuffer.length > 0) {
          // Only flush if there is actual content (not just empty text)
          const hasContent = textBuffer.some(n =>
            isTextNode(n) ? n.text.trim().length > 0 : true
          )
          if (hasContent) {
            result.push({ ...block, children: textBuffer.map(sanitizeInline) })
          }
          textBuffer = []
        }
      }

      for (const child of block.children) {
        if (child.type === 'image') {
          flushText()
          result.push({
            type: 'image',
            src: child.src,
            alt: child.alt,
            title: child.title,
            children: [{ text: '' }],
          })
        } else {
          textBuffer.push(child)
        }
      }
      flushText()

      return result.length > 0 ? result : [{ type: 'paragraph', children: [{ text: '' }] }]
    }

    // No inline images — just sanitize children
    const sanitizedChildren = block.children.map(sanitizeInline)
    
    // Recurse into nested blocks (e.g. list items, blockquotes, layout areas)
    if (block.type === 'unordered-list' || block.type === 'ordered-list') {
      return [{ ...block, children: block.children.flatMap(sanitizeBlock) }]
    }
    if (block.type === 'list-item' || block.type === 'list-item-content') {
      return [{ ...block, children: block.children.flatMap(sanitizeBlock) }]
    }
    if (block.type === 'blockquote') {
      return [{ ...block, children: block.children.flatMap(sanitizeBlock) }]
    }
    if (block.type === 'layout') {
      return [{ ...block, children: block.children.map((area: DocNode) => ({
        ...area,
        children: area.children ? area.children.flatMap(sanitizeBlock) : area.children,
      }))}]
    }

    return [{ ...block, children: sanitizedChildren }]
  }

  return [block]
}

/**
 * Sanitize an entire document tree so it can be safely rendered by
 * Keystatic\'s DocumentRenderer without "Unknown inline node type" errors.
 */
export function sanitizeDocument(document: DocNode[]): DocNode[] {
  if (!Array.isArray(document)) return document
  return document.flatMap(sanitizeBlock)
}
