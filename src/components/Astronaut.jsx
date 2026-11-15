import React from 'react'

export const AVATARS = [
  { id: 'fox', emoji: '🦊' }, { id: 'cat', emoji: '🐱' }, { id: 'panda', emoji: '🐼' },
  { id: 'robot', emoji: '🤖' }, { id: 'alien', emoji: '👽' }, { id: 'owl', emoji: '🦉' },
]
export const SUIT_COLORS = ['#ff5ca8', '#35d0ff', '#ff9f43', '#7cffb2', '#a78bfa', '#ffd166']
export const avatarEmoji = (id) => (AVATARS.find((a) => a.id === id) || AVATARS[0]).emoji

// Cartoon astronaut. `face` is an emoji (player) or initials (real astronaut illustration).
export default function Astronaut({ avatar = 'fox', color = '#35d0ff', size = 90, face, wave = false, float = false, className = '' }) {
  const content = face || avatarEmoji(avatar)
  const isText = face && face.length <= 3 && /^[A-Z]+$/.test(face)
  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} className={`astro ${float ? 'floaty' : ''} ${className}`} role="img" aria-label="astronaut">
      <rect x="22" y="56" width="56" height="44" rx="18" fill={color} stroke="#fff" strokeWidth="3" />
      <rect x="40" y="70" width="20" height="14" rx="4" fill="#fff" opacity=".85" />
      <circle cx="46" cy="77" r="2.5" fill="#35d0ff" /><circle cx="54" cy="77" r="2.5" fill="#ff5ca8" />
      <g className={wave ? 'wave' : ''}><rect x="10" y="60" width="16" height="30" rx="8" fill={color} stroke="#fff" strokeWidth="3" /></g>
      <rect x="74" y="60" width="16" height="30" rx="8" fill={color} stroke="#fff" strokeWidth="3" />
      <rect x="28" y="94" width="16" height="14" rx="6" fill="#fff" /><rect x="56" y="94" width="16" height="14" rx="6" fill="#fff" />
      <circle cx="50" cy="38" r="33" fill="#f4f6ff" stroke="#b8c0ff" strokeWidth="3" />
      <rect x="26" y="20" width="48" height="36" rx="18" fill="#1c2155" stroke="#7c8bff" strokeWidth="2" />
      <ellipse cx="38" cy="27" rx="8" ry="4" fill="#fff" opacity=".35" />
      {isText ? (
        <text x="50" y="45" textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff" fontFamily="Baloo 2, sans-serif">{content}</text>
      ) : (
        <text x="50" y="46" textAnchor="middle" fontSize="24">{content}</text>
      )}
    </svg>
  )
}
