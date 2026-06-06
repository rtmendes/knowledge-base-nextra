interface IframeAppProps {
  src: string
  title?: string
  height?: string
}

export function IframeApp({ src, title = 'Interactive App', height = '600px' }: IframeAppProps) {
  return (
    <div style={{ margin: '1rem 0' }}>
      <iframe
        src={src}
        title={title}
        style={{
          width: '100%',
          height: height,
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem'
        }}
      />
    </div>
  )
}
