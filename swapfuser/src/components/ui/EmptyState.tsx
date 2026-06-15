interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = "inbox", title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <span className="material-symbols-outlined text-[56px] text-on-surface-variant/30 mb-4">
        {icon}
      </span>
      <p className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-2">{title}</p>
      {body && <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-4">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 bg-primary text-on-primary font-username-sm text-username-sm px-5 py-2 rounded-full hover:bg-primary-container transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

