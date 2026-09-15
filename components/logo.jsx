'use client'

import Link from 'next/link'

/**
 * Brand icon — coral tile with the white "Bubble D" mark: the D of DM
 * drawn as a message bubble. Matches app/icon.svg, sharp down to 16px.
 */
function BrandIcon() {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center btn-primary">
      <svg viewBox="0 0 64 64" fill="white" className="w-5 h-5" aria-hidden="true">
        <path
          fillRule="evenodd"
          transform="translate(-1 -1)"
          d="M18 14H31C41.5 14 48 21 48 30C48 39 41.5 46 31 46H26L18 52Z M26 22H31C36.5 22 40 25.5 40 30C40 34.5 36.5 38 31 38H26Z"
        />
      </svg>
    </div>
  )
}

/**
 * Brand wordmark — "DM" in coral primary, "Forge" in muted text,
 * matching the official DMForge wordmark style.
 */
function BrandName() {
  return (
    <span className="font-display font-bold text-xl tracking-tight">
      <span className="text-[#FF4D6D]">DM</span>
      <span className="text-[#A0A0C8]">Forge</span>
    </span>
  )
}

/**
 * Shared brand logo — coral anvil-tile icon + "DMForge" wordmark.
 * "DM" in coral + "Forge" in muted, Fraunces display font.
 *
 * @param {{ href?: string, whiteLabel?: { logoUrl?: string, brandName?: string, hideParentBranding?: boolean } }} props
 *   - href: where the logo links (default "/")
 *   - whiteLabel: optional white-label overrides from agency settings
 */
export function Logo({ href = '/', whiteLabel }) {
  const mark = whiteLabel?.logoUrl ? (
    <img src={whiteLabel.logoUrl} alt={whiteLabel.brandName || 'logo'} className="h-7 w-auto rounded" />
  ) : (
    <BrandIcon />
  )

  const wordmark = whiteLabel?.brandName ? (
    <span className="font-display font-bold text-xl tracking-tight">{whiteLabel.brandName}</span>
  ) : (
    <BrandName />
  )

  return (
    <Link href={href} className="inline-flex items-center gap-2">
      {mark}
      {wordmark}
      {whiteLabel && !whiteLabel.hideParentBranding && (
        <span className="text-[10px] text-[#A0A0C8]">by DMForge</span>
      )}
    </Link>
  )
}
