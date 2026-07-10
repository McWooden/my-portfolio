# Design Rules & Constraints

> [!IMPORTANT]
> **STRICT COMPLIANCE:** No hardcoded styling (colors, fonts, sizes). Use theme tokens in `globals.css` only.

## 1. Colors (No Raw Hex/RGBA in JSX)
- `bg-bg-dark` (#1a1a1a): Screen BG
- `bg-bg-card` (#262626) / `-hover` (#333333): Cards, lists, interactive elements
- `text-text-primary` (#eaeaea) / `-secondary` (#bdbdbd) / `-muted` (#888888): Text hierarchy
- `text-accent` / `bg-accent` (#e0ff6f): Brand light yellow/green
- `bg-accent-muted` (rgba(224, 255, 111, 0.5)): Highlights
- `border-border` (rgba(234, 234, 234, 0.1)) / `-focus` (rgba(234, 234, 234, 0.3)): Dividers, borders

## 2. Typography
- `font-sans`: Body, forms, navigation (Inter)
- `font-mono`: Statuses, stats, code/meta details (DM Mono)
- `font-sedgwick`: Accent/decorative handwritten text (Sedgwick Ave)

## 3. Fixed Header Layout
- **Fixed Header**: `fixed top-0 left-0 w-full h-[100px] z-[1000]`
- **Page Offset**: Use `pt-[100px]` (standard) or `pt-[140px]` (hero/visual) to clear header.
- **Heights**: Use `min-h-[calc(100vh-100px)]` instead of `min-h-screen`.
- **Absolute Elements**: Parent MUST have `relative` + `overflow-hidden` to prevent horizontal/vertical scrolling.

## 4. Custom Classes
- **Online status**: `<span className="pulse-dot status-available"></span>` (statuses: `available`, `working`, `busy`, `holiday`).
- **Animations**: `animate-float`, `animate-float-delayed`, `animate-ticker`.
- **Lists**: `accent-list-item` (prepends `✦`).
- **Scroll reveal**: `reveal-item` (combined with `.revealed`).

## 5. Checklist
- No inline styles or hardcoded hex colors (`#...`).
- Parent containers hold absolute children bounds.
- No horizontal scrollbars.
