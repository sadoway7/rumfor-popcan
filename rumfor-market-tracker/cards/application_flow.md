# Application Flow

**Goal:** Shorten time from “Apply” to “Submitted”.

**Focus areas:**
- Pre-fill user data
- Progressive steps with a progress indicator
- Save & continue later

**Primary flow:**
1. Choose market → Apply
2. Review market info + vendor limits
3. Complete application (prefilled contact info)
4. Save draft or Submit
5. Track status timeline (submitted → under review → approved/rejected)

**Friction points to address:**
- No visible step/progress indicator in form
- Draft save lacks “last saved” timestamp/confirmation
- Rejection action disabled for promoters in UI
- Validation errors only show per-field; no top summary

**Success states:**
- “Application submitted” confirmation route with next steps
- Draft save banner + continue CTA
- Status timeline visible on application detail

**Error states:**
- Submit failure shows inline error and retry
- File upload errors list specific file reasons

**Success metric:** Application completion rate > 70%.
