export function TR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 800" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <polygon points="583.33,400 706.87,440.14 659.84,319.86 659.84,480.14 706.87,359.86" fill="#fff" />
    </svg>
  );
}

export function GB({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  );
}

export const supportedLanguages = [
  { code: "tr", flag: <TR className="w-4 h-3 rounded-[2px] object-cover inline-block" />, label: "Türkçe" },
  { code: "en", flag: <GB className="w-4 h-3 rounded-[2px] object-cover inline-block" />, label: "English" },
];

