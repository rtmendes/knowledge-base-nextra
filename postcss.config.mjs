/** @type {import('postcss-load-config').Config} */
export default (ctx) => {
  // Skip tailwindcss processing for node_modules CSS (e.g. nextra-theme-docs)
  // to avoid "@layer base" conflicts with @tailwind base directive
  const isNodeModules = ctx.file && /node_modules/.test(ctx.file)
  
  return {
    plugins: {
      ...(!isNodeModules ? { tailwindcss: {} } : {}),
      autoprefixer: {},
    },
  }
}
