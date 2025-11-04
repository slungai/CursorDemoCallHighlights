# Call Highlights - Simple Project Plan

## Overview
A minimal single-page web app for pasting daily call transcripts from Notion's meeting recorder and viewing basic insights. Clean, Notion-inspired design.

## Project Structure
```
CallHighlights/
├── index.html          # Main HTML
├── styles.css          # Styling (Notion-inspired)
└── script.js           # App logic
```

## Features

### 1. Input Section
- Large textarea to paste transcript
- Date picker (defaults to today)
- Save button

### 2. Simple Insights
- Total calls count
- Total words across all calls
- Average words per call
- Most active day of week

### 3. Call History
- List of all saved calls (newest first)
- Shows: date, word count, preview (first 50 chars)
- Click to view full transcript
- Delete button on each call

## Design (Notion-Style)

**Colors:**
- Background: `#ffffff` and `#f7f6f3`
- Text: `#37352f` (dark), `#9b9a97` (light)
- Accent: `#2383e2` (blue buttons)
- Borders: `#e9e9e7`

**Layout:**
- Single column, max-width 800px
- Top: Input area
- Middle: 4 insight cards (grid)
- Bottom: Call list

**Style:**
- Clean, minimal cards with subtle shadows
- System fonts (San Francisco, Segoe UI)
- Generous spacing
- Smooth hover states

## Technical

**Storage:** localStorage (JSON array)
- Each call: `{id, date, transcript}`

**JavaScript:**
- Save/load/delete from localStorage
- Calculate basic metrics
- Render insights and call list

**No external libraries** - pure HTML/CSS/JS

## User Flow
1. Open app → see empty state or existing calls
2. Paste transcript → enter text
3. Click save → transcript saved
4. View insights → see updated metrics
5. Browse history → click calls to view/delete

