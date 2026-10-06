// Hidden field for bots. People never see or fill it; if it has a value, the form
// pretends to succeed and sends nothing. Pair with the per-email limit in the database.
export default function Honeypot({ value, onChange }) {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
