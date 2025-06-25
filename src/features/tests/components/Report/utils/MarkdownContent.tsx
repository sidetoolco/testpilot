import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content?: string;
  className?: string;
}

const formatVariants = (content: string): string => {
  // Validar que content sea un string válido
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Convertir "Variant A", "Variant B", "Variant C" a negrita
  return content
    .replace(/\bVariant A\b/g, '**Variant A**')
    .replace(/\bVariant B\b/g, '**Variant B**')
    .replace(/\bVariant C\b/g, '**Variant C**');
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content = '', className = '' }) => {
  // Validar que content sea un string válido antes de procesarlo
  if (!content || typeof content !== 'string') {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <p className="text-gray-500 italic">No content available</p>
      </div>
    );
  }

  const formattedContent = formatVariants(content);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="text-gray-700 mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 rounded p-4 overflow-x-auto my-4">{children}</pre>
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
};
