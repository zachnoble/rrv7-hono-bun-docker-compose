// Bun workaround for using renderToReadableStream in react-dom/server
// Used in entry.server.tsx; likely not needed in the future

declare module 'react-dom/server.browser' {
	export { renderToReadableStream } from 'react-dom/server'
}
