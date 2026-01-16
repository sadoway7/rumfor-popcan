# Hashtag Voting

**Goal:** Make tags useful for discovery while reducing voting noise and bias.

**Focus areas:**
- Tag limits per user to curb spam (daily cap + per-market cap)
- Suggested tags per market type and persona context (vendor, promoter, community)
- Accessibility tags aligned to primary filters (wheelchair, parking, restrooms)
- Trending hashtags surfaced in discovery (top-voted + recent + verified tags)
- Clear voting cues to reduce duplicate tagging (already-voted state + undo)
- Tie-break rules for low-signal tags (hide until threshold)

**Success metric:** Search click-through rate up 15% with a 25% drop in low-signal tags.

**Success states:**
- Vote count updates with inline confirmation
- Duplicate tag submissions convert to “vote added” instead of error

**Error states:**
- Rate limit shows “Try again later” with remaining votes
- Invalid/blocked tags show “Not allowed” with guideline link
