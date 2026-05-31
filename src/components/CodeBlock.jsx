export default function CodeBlock({ code, title }) {
  return (
    <div className="code-block">
      {title && <div className="code-block-title">{title}</div>}
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
