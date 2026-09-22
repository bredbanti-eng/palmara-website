export default function PalmaraIcon({ size = 32, reversed = false }) {
  const ring = reversed ? "#F6D77A" : "#B8860B";
  const lines = reversed ? "#F6D77A" : "#7A1220";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="54" fill="none" stroke={ring} strokeWidth="4" />
      <path d="M40 82 C 44 65 48 50 56 36" fill="none" stroke={lines} strokeWidth="6" strokeLinecap="round" />
      <path d="M52 86 C 58 68 64 52 74 40" fill="none" stroke={lines} strokeWidth="6" strokeLinecap="round" />
      <path d="M66 84 C 72 70 78 58 86 48" fill="none" stroke={lines} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
