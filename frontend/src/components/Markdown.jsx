import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// Coursera/Udemy-style rich notes renderer: headings, bold/italic,
// bullet & numbered lists, task lists, tables, blockquotes, links,
// inline code and fenced code blocks with syntax highlighting.
// Raw HTML is intentionally NOT enabled (no rehype-raw) — notes are
// plain markdown only, which keeps this safe to render without sanitizing.
export default function Markdown({ children }) {
  if (!children?.trim()) return null

  return (
    <div className="markdown-notes text-sm leading-relaxed text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...p }) => <h1 className="text-xl font-black text-white mt-5 mb-2 first:mt-0" {...p} />,
          h2: ({ node, ...p }) => <h2 className="text-lg font-black text-white mt-5 mb-2 first:mt-0" {...p} />,
          h3: ({ node, ...p }) => <h3 className="text-base font-bold text-white mt-4 mb-2 first:mt-0" {...p} />,
          h4: ({ node, ...p }) => <h4 className="text-sm font-bold text-white mt-3 mb-1.5 first:mt-0" {...p} />,
          p:  ({ node, ...p2 }) => <p className="mb-3 last:mb-0" {...p2} />,
          strong: ({ node, ...p }) => <strong className="font-bold text-white" {...p} />,
          em: ({ node, ...p }) => <em className="italic text-slate-200" {...p} />,
          a:  ({ node, ...p }) => <a className="text-primary-400 hover:underline font-medium" target="_blank" rel="noreferrer" {...p} />,
          ul: ({ node, ...p }) => <ul className="mb-3 ml-1 space-y-1.5 list-disc list-inside marker:text-primary-400" {...p} />,
          ol: ({ node, ...p }) => <ol className="mb-3 ml-1 space-y-1.5 list-decimal list-inside marker:text-primary-400" {...p} />,
          li: ({ node, ...p }) => <li className="pl-1" {...p} />,
          blockquote: ({ node, ...p }) => (
            <blockquote className="border-l-4 border-primary-500/40 bg-primary-500/5 pl-4 py-2 my-3 italic text-slate-300 rounded-r-lg" {...p} />
          ),
          hr: () => <hr className="my-4 border-white/10" />,
          code: ({ node, inline, className, children, ...p }) => {
            if (inline) {
              return <code className="bg-white/10 text-accent-400 px-1.5 py-0.5 rounded text-[13px] font-mono" {...p}>{children}</code>
            }
            return <code className={`text-[13px] font-mono ${className || ''}`} {...p}>{children}</code>
          },
          pre: ({ node, ...p }) => (
            <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-4 overflow-x-auto mb-3 text-[13px]" {...p} />
          ),
          table: ({ node, ...p }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse" {...p} />
            </div>
          ),
          thead: ({ node, ...p }) => <thead className="bg-white/5" {...p} />,
          th: ({ node, ...p }) => <th className="text-left font-bold text-white px-3 py-2 border border-white/10" {...p} />,
          td: ({ node, ...p }) => <td className="px-3 py-2 border border-white/10 text-slate-300" {...p} />,
          img: ({ node, ...p }) => <img className="rounded-xl max-w-full my-3 border border-white/10" {...p} />,
          input: ({ node, ...p }) => <input className="mr-2 accent-primary-500" disabled {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
