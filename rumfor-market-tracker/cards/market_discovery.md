# Market Discovery

**Goal:** Make it easy for vendors to find relevant markets quickly.

**Focus areas:**
- Progressive filters (show 3–5 first) with role presets
- Location-first results and proximity-aware defaults
- Trending hashtags surfaced without overwhelming filters
- Accessibility-first quick filters (wheelchair, parking, restrooms)
- Clear empty states
- Fast mobile performance

**Primary flow:**
1. Enter location (city/state) to anchor results
2. Select persona preset (vendor, promoter, community) or keep default
3. Add a quick filter (category or accessibility)
4. Tap a trending hashtag if desired
5. Scan results (nearby + soonest dates)
6. Open market details
7. Tap “Track Market” to follow

**Friction points to address:**
- Filter density in sidebar hides “Track Market” goal on smaller screens
- Search fires on every keystroke; no explicit “Apply” or recent searches
- Sorting is separate from filters, but no clarity on default priority
- “Track” success has no confirmation affordance beyond button state
- Mobile map/list toggle not obvious and hides active filters

**Taxonomy & filters guidance:**
- Keep category list consistent with market taxonomy (no duplicates or synonyms).
- Use accessibility filters as primary quick filters alongside location.
- Trending hashtags should reflect top-voted tags and accessibility needs.

**Success states:**
- Results count updates instantly with clear context (location + date range)
- “Tracked” state confirms action and persists on refresh
- Empty state offers “Clear filters” + “Refresh markets”
- Preset pill shows active persona and can be cleared in one tap

**Error states:**
- Failed load provides actionable retry
- Track/untrack errors show inline toast, not console-only
- Geolocation denied prompts manual location entry with CTA

**Success metric:** Time to first “Track Market” < 60s.
