type SocialMediaButtonsProps = {
  className?: string;
  compact?: boolean;
};

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M14.8 3c.3 2 1.5 3.8 3.4 4.8.9.5 1.8.7 2.8.8v3.1c-1.7-.1-3.4-.6-4.9-1.6v5.7c0 3.8-3 6.7-6.8 6.7S2.5 19.6 2.5 15.8 5.5 9 9.3 9c.3 0 .7 0 1 .1v3.2c-.3-.1-.7-.2-1-.2-2 0-3.6 1.6-3.6 3.7s1.6 3.6 3.6 3.6 3.7-1.5 3.7-3.9V3h1.8Z" />
    </svg>
  );
}

export default function SocialMediaButtons({
  className = "",
  compact = false,
}: SocialMediaButtonsProps) {
  const baseClass = compact
    ? "inline-flex items-center justify-center rounded-full border border-brand-purple/20 p-2 text-brand-purple transition hover:border-brand-orange hover:text-brand-orange"
    : "inline-flex items-center gap-2 rounded-full border border-brand-purple/20 px-3 py-2 text-sm font-medium text-brand-purple transition hover:border-brand-orange hover:text-brand-orange";

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <a
        href="https://instagram.com/dipswellness"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @dipswellness"
        className={baseClass}
      >
        <InstagramIcon />
        {!compact ? <span>@dipswellness</span> : null}
      </a>

      <a
        href="https://www.tiktok.com/@dipswellness"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok @dipswellness"
        className={baseClass}
      >
        <TikTokIcon />
        {!compact ? <span>@dipswellness</span> : null}
      </a>
    </div>
  );
}
