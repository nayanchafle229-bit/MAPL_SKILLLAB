import React from 'react'

/* ══════════════════════════════════════════════════════════════
   Shared icon set — replaces emoji throughout the app.
   Stroke-based, inherits currentColor, sized via className.
   Import what you need: import { IconHome, IconBrain } from '../components/Icons'
   ══════════════════════════════════════════════════════════════ */

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }

export const IconHome = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" /></svg>
)
export const IconBrain = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
)
export const IconBook = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2z" /></svg>
)
export const IconChart = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 20V10m6 10V4m6 16v-7m6 7V8" /></svg>
)
export const IconTrophy = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" /></svg>
)
export const IconUser = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0" /></svg>
)
export const IconTrending = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" /></svg>
)
export const IconHelp = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2 2-2.5 3.2M12 17h.01M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
)
export const IconUsers = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-1a4 4 0 00-3-3.87M9 20H4v-1a4 4 0 013-3.87m5-2.13a4 4 0 100-8 4 4 0 000 8zm7-4a4 4 0 01-2.34 3.64" /></svg>
)
export const IconAward = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15a6 6 0 100-12 6 6 0 000 12zm-3.5 1.5L7 21l5-2.5L17 21l-1.5-4.5" /></svg>
)
export const IconLogout = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 14l5-5-5-5m5 5H9" /></svg>
)
export const IconMenu = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
)
export const IconClose = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
)
export const IconCheck = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
)
export const IconAlertTriangle = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
)
export const IconInfo = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
export const IconInbox = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 12h4l2 3h4l2-3h4M5 12L3.5 6.5A1 1 0 014.46 5h15.08a1 1 0 01.96 1.5L19 12v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" /></svg>
)
export const IconChevronRight = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
)
export const IconMedal = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15a5 5 0 100-10 5 5 0 000 10zm-2.5.9L8 21l4-2 4 2-1.5-5.1" /></svg>
)
export const IconCalendar = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" /></svg>
)
export const IconClock = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
export const IconStar = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 3z" /></svg>
)
export const IconLayers = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5m-18 4l9 5 9-5" /></svg>
)
export const IconSearch = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
)
export const IconRefresh = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0113.9-3.5L20 9m-15.5 6A8 8 0 0018.4 18.5L20 15" /></svg>
)
export const IconRocket = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 2c2 2 3.5 5 3.5 9 0 2-.5 4-1.5 5.5l-2-1.5-2 1.5C9 15 8.5 13 8.5 11c0-4 1.5-7 3.5-9zm0 0S8 4 6 8s-1 6-1 6l3-1m8-5s4 2 6 6 1 6 1 6l-3-1M9.5 17.5L7 20m9.5-2.5L19 20M10 12a2 2 0 104 0 2 2 0 00-4 0z" /></svg>
)
export const IconPlay = (p) => (
  <svg {...base} fill="currentColor" {...p}><path d="M8 5v14l11-7z" /></svg>
)
export const IconFilm = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 4h16v16H4V4zM4 9h16M4 15h16M9 4v16M15 4v16" /></svg>
)
export const IconTarget = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-3a2 2 0 100-4 2 2 0 000 4z" /></svg>
)
export const IconShield = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /></svg>
)
export const IconThumbsUp = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 22V11m0 11H4a1 1 0 01-1-1v-9a1 1 0 011-1h3m3 0V6a3 3 0 013-3l1 1-1 5h6a2 2 0 012 2l-1.5 8a2 2 0 01-2 1.5H10a3 3 0 01-3-3z" /></svg>
)
export const IconMinusCircle = (p) => (
  <svg {...base} {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
