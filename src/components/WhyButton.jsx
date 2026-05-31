import { useState } from 'react';

export default function WhyButton({ topic, content }) {
  const [open, setOpen] = useState(false);
  const data = content || topic;

  if (!data) return null;

  return (
    <div className="why-block">
      <button
        type="button"
        className="btn-why"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Zašto? — {data.title}
      </button>
      {open && (
        <div className="why-panel">
          {data.body.split('\n').map((line, i) => (
            <p key={i}>
              {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                part.startsWith('**') ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                )
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
