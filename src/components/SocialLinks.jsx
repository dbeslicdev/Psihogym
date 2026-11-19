import { socialProfiles } from "../content/site.js";

export default function SocialLinks({ className = "" }) {
  return (
    <div className={`social-links ${className}`}>
      {socialProfiles.map((profile) => (
        <a key={profile.id} href={profile.url} target="_blank" rel="noopener noreferrer"
          aria-label={`${profile.label} — Psihogym (novi prozor)`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
            {profile.id === "facebook" ? (
              <path fill="currentColor" d="M14 21v-8h3l.5-4H14V7c0-1.1.3-2 2-2h2V1.4c-.4-.1-1.8-.2-3.3-.2-3.3 0-5.7 2-5.7 5.8v2H6v4h3v8z" />
            ) : (
              <>
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </>
            )}
          </svg>
          <span>{profile.label}</span>
        </a>
      ))}
    </div>
  );
}
