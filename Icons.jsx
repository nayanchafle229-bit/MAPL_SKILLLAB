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
