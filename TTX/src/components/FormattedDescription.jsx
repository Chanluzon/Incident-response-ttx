import React from 'react';

/**
 * Formats a description string into a bulleted list if it contains multiple lines
 * or starts with a hyphen.
 */
const FormattedDescription = ({ description, className = "", isCard = false }) => {
  if (!description) return null;

  // Split by newlines and filter out empty lines
  const lines = description.split(/\n/).filter(line => line.trim() !== "");

  // If it's a single line and doesn't start with a hyphen, just render it as text
  if (lines.length === 1 && !lines[0].trim().startsWith('-')) {
    return <span className={className}>{description}</span>;
  }

  // Render mixed content
  return (
    <div className={`text-left ${isCard ? 'space-y-0.5' : 'space-y-3'} ${className}`}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isBullet = trimmedLine.startsWith('-') || trimmedLine.startsWith('\u2022');
        const cleanLine = trimmedLine.replace(/^[-\u2022]\s*/, '').trim();

        if (!cleanLine) return null;

        if (isBullet) {
          if (isCard) {
            return (
              <div key={index} className="flex items-start gap-1.5 overflow-hidden">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-40 flex-shrink-0" />
                <span className="truncate">{cleanLine}</span>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-start gap-3 group pl-1">
              <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0 group-hover:opacity-100 transition-opacity" />
              <span className="leading-relaxed">{cleanLine}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className={`${isCard ? 'truncate' : 'leading-relaxed'}`}>
            {cleanLine}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedDescription;
