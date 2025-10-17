// frontend/src/components/ui/Field.jsx
export default function Field({ label, children }) {
    return (
      <div className="space-y-1">
        {label && <label className="text-sm font-medium">{label}</label>}
        {children}
      </div>
    );
  }