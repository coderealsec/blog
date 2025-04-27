export function SimpleEditor({ value, onChange }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <textarea
        className="w-full min-h-[200px] max-h-[400px] p-4 font-sans text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ direction: 'ltr', resize: 'vertical' }}
        placeholder="İçeriğinizi buraya yazın..."
      />
    </div>
  );
} 