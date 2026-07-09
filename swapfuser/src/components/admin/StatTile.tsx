interface StatTileProps {
  icon: string;
  label: string;
  value: number | null;
  format?: (n: number) => string;
}

function defaultFormat(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function StatTile({ icon, label, value, format = defaultFormat }: StatTileProps) {
  return (
    <div className="bg-surface-container-lowest p-4 lg:p-5 rounded-xl shadow-sm border border-outline-variant/20">
      <div className="w-11 h-11 bg-primary-container/10 text-primary flex items-center justify-center rounded-lg mb-3">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">{label}</p>
      <h3 className="font-headline-md text-headline-md text-on-surface">
        {value === null ? "—" : format(value)}
      </h3>
    </div>
  );
}
