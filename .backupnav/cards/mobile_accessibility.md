# Mobile Accessibility

**Goal:** Ensure mobile-first usability.

**Focus areas:**
- Touch target sizing (minimum 44x44px)
- Color contrast
- Focus states for keyboard users
- Large, thumb-friendly primary actions in auth and discovery
- Modal flows: trapped focus, visible close, and “safe” swipe-to-dismiss
- Error/success copy fits 2 lines on small screens

**Success metric:** Accessibility audit passes WCAG AA and mobile tap error rate drops.

**Modal flow checklist:**
- First focus lands on modal heading
- Primary action is reachable without scroll when possible
- Escape closes modal with confirmation on destructive actions

**Error states:**
- Inline errors announce to screen readers
- Toasts do not block primary CTA
