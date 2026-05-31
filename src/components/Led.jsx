export default function Led({ label, on, pin, size = 'md' }) {
  return (
    <div className={`led-wrap led-${size}`}>
      <div
        className={`led-bulb ${on ? 'led-on' : ''}`}
        aria-label={`${label} ${on ? 'on' : 'off'}`}
      />
      <span className="led-label">{label}</span>
      {pin && <span className="led-pin">{pin}</span>}
    </div>
  );
}
