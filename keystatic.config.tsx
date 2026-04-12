import { config, collection, fields, component } from '@keystatic/core'

const isProd = !!process.env.KEYSTATIC_GITHUB_CLIENT_ID

export default config({
  storage: isProd
    ? {
        kind: 'github',
        repo: { owner: 'rtmendes', name: 'knowledge-base-nextra' },
      }
    : { kind: 'local' },

  ui: {
    brand: { name: 'InsightProfit KB' },
    navigation: {
      Documentation: ['docs'],
      Projects: ['projects'],
    },
  },

  collections: {
    // ─── Main docs/pages collection ───────────────────────────────────────────
    docs: collection({
      label: 'Documentation Pages',
      slugField: 'title',
      path: 'content/docs/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: '✅ Active', value: 'active' },
            { label: '📝 Draft', value: 'draft' },
            { label: '📦 Archived', value: 'archived' },
          ],
          defaultValue: 'active',
        }),
        category: fields.text({ label: 'Category / Folder Name' }),
        order: fields.integer({
          label: 'Sidebar Order (lower = first)',
          defaultValue: 100,
          validation: { isRequired: false, min: 0, max: 9999 },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'Tag',
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/docs',
          publicPath: '/images/docs/',
          validation: { isRequired: false },
        }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          dividers: true,
          links: true,
          tables: true,
          images: {
            directory: 'public/images/docs',
            publicPath: '/images/docs/',
          },
          componentBlocks: {
            VideoEmbed: component({
              label: '▶ Video Embed',
              preview: (props) => (
                <div style={{ background: '#111', color: '#fff', padding: '12px', borderRadius: 8 }}>
                  <strong>🎥 Video:</strong> {props.fields.url.value || 'No URL set'}
                  {props.fields.caption.value && (
                    <p style={{ marginTop: 4, fontSize: 12, color: '#aaa' }}>
                      {props.fields.caption.value}
                    </p>
                  )}
                </div>
              ),
              schema: {
                url: fields.url({
                  label: 'Video URL',
                  description: 'YouTube, Vimeo, Loom, Genspark, or direct video URL',
                  validation: { isRequired: true },
                }),
                caption: fields.text({
                  label: 'Caption',
                  validation: { isRequired: false },
                }),
                autoplay: fields.checkbox({
                  label: 'Autoplay',
                  defaultValue: false,
                }),
              },
            }),

            Callout: component({
              label: '💬 Callout Box',
              preview: (props) => (
                <div
                  style={{
                    borderLeft: '4px solid',
                    borderColor:
                      props.fields.type.value === 'warning'
                        ? '#f59e0b'
                        : props.fields.type.value === 'error'
                        ? '#ef4444'
                        : props.fields.type.value === 'success'
                        ? '#10b981'
                        : '#3b82f6',
                    padding: '8px 12px',
                    borderRadius: 4,
                    background: '#f8fafc',
                  }}
                >
                  {props.fields.title.value && (
                    <strong>{props.fields.title.value}</strong>
                  )}
                  <p style={{ margin: 0, fontSize: 14 }}>{props.fields.body.value}</p>
                </div>
              ),
              schema: {
                type: fields.select({
                  label: 'Type',
                  options: [
                    { label: '💡 Info', value: 'info' },
                    { label: '⚠️ Warning', value: 'warning' },
                    { label: '✅ Success', value: 'success' },
                    { label: '❌ Error', value: 'error' },
                    { label: '📌 Note', value: 'note' },
                  ],
                  defaultValue: 'info',
                }),
                title: fields.text({
                  label: 'Title',
                  validation: { isRequired: false },
                }),
                body: fields.text({
                  label: 'Body',
                  multiline: true,
                }),
              },
            }),

            FileAttachment: component({
              label: '📎 File Attachment',
              preview: (props) => (
                <div style={{ border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: 6 }}>
                  📎 <strong>{props.fields.filename.value || 'File'}</strong>
                  {props.fields.description.value && (
                    <span style={{ color: '#64748b', marginLeft: 8 }}>
                      — {props.fields.description.value}
                    </span>
                  )}
                </div>
              ),
              schema: {
                url: fields.url({
                  label: 'File URL',
                  description: 'Direct link to the file (Supabase, GitHub, etc.)',
                  validation: { isRequired: true },
                }),
                filename: fields.text({ label: 'Display Name' }),
                description: fields.text({
                  label: 'Description',
                  validation: { isRequired: false },
                }),
                fileType: fields.select({
                  label: 'File Type',
                  options: [
                    { label: 'PDF', value: 'pdf' },
                    { label: 'Word Doc', value: 'docx' },
                    { label: 'Spreadsheet', value: 'xlsx' },
                    { label: 'Image', value: 'image' },
                    { label: 'HTML', value: 'html' },
                    { label: 'Markdown', value: 'md' },
                    { label: 'Other', value: 'other' },
                  ],
                  defaultValue: 'other',
                }),
              },
            }),

            EmbedBlock: component({
              label: '🌐 Embed (iframe)',
              preview: (props) => (
                <div style={{ background: '#f0f9ff', border: '1px dashed #0ea5e9', padding: 12, borderRadius: 8 }}>
                  🌐 Embed: {props.fields.url.value || 'No URL'}
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Height: {props.fields.height.value || 500}px
                  </div>
                </div>
              ),
              schema: {
                url: fields.url({
                  label: 'URL to Embed',
                  description: 'Genspark, Manus, interactive app, or any iframe-able URL',
                  validation: { isRequired: true },
                }),
                title: fields.text({ label: 'Title (for accessibility)' }),
                height: fields.integer({
                  label: 'Height (px)',
                  defaultValue: 600,
                }),
              },
            }),
          },
        }),
      },
    }),

    // ─── Projects collection (50+ projects metadata) ──────────────────────────
    projects: collection({
      label: 'Projects',
      slugField: 'name',
      path: 'content/projects/*',
      schema: {
        name: fields.slug({ name: { label: 'Project Name' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: '🟢 Active', value: 'active' },
            { label: '🟡 In Progress', value: 'in-progress' },
            { label: '🔵 Draft', value: 'draft' },
            { label: '⚫ Archived', value: 'archived' },
          ],
          defaultValue: 'active',
        }),
        category: fields.multiselect({
          label: 'Categories',
          options: [
            { label: 'AI Tools', value: 'ai-tools' },
            { label: 'Automation', value: 'automation' },
            { label: 'Content', value: 'content' },
            { label: 'Interactive', value: 'interactive' },
            { label: 'Business', value: 'business' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Finance', value: 'finance' },
            { label: 'Research', value: 'research' },
          ],
        }),
        url: fields.url({
          label: 'Live URL',
          validation: { isRequired: false },
        }),
        githubRepo: fields.text({
          label: 'GitHub Repo',
          validation: { isRequired: false },
        }),
        docsSlug: fields.text({
          label: 'Docs Slug (links to docs collection)',
          description: 'e.g. insightprofit-popebot',
          validation: { isRequired: false },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'Tag',
        }),
        priority: fields.integer({
          label: 'Priority (1=highest)',
          defaultValue: 10,
        }),
        createdAt: fields.text({
          label: 'Created Date (ISO)',
          validation: { isRequired: false },
        }),
        notes: fields.text({
          label: 'Internal Notes',
          multiline: true,
          validation: { isRequired: false },
        }),
      },
    }),
  },
})
