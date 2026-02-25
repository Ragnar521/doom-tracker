# Stack Research: Enhanced Analytics Dashboard

**Domain:** Fitness tracking analytics and data visualization
**Researched:** 2026-02-25
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Already in Place)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2 | UI framework | Already in use, excellent performance with concurrent features, perfect for interactive dashboards |
| TypeScript | ~5.9 | Type safety | Already in use, essential for large-scale data processing with type-safe calculations |
| Tailwind CSS | 3.4 | Styling framework | Already in use, utility-first approach ideal for custom grid layouts without heavy chart libraries |
| Firebase Firestore | 12.7 | Database | Already in use, real-time sync, cursor-based pagination support for large datasets |
| Vite | 7.2 | Build tool | Already in use, fast HMR for development, code splitting for performance |

**Rationale:** Your existing stack is already optimal for analytics features. No major dependencies needed.

### Supporting Libraries (Recommended Additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Virtual | ^3.10.0 | Virtualization engine | When rendering 100+ weeks in timeline (headless, framework-agnostic, modern alternative to react-window) |
| react-intersection-observer | ^9.13.0 | Lazy loading trigger | For collapsible sections that load data on expand (wrapper around IntersectionObserver API) |

**Why TanStack Virtual over react-window:**
- **Context:** TanStack Virtual is the modern, maintained successor in the virtualization space as of 2026
- **Headless design:** Provides virtualization logic without UI opinions, perfect for custom DOOM-themed styling
- **TypeScript-first:** Built with TypeScript from the ground up
- **Performance:** Superior performance for dynamic content heights (timeline with varying month/year sections)
- **Sources:** [Understanding TanStack Virtual](https://conzit.com/post/understanding-tanstack-virtual-a-key-to-react-performance), [Optimizing Large Datasets](https://medium.com/@eva.matova6/optimizing-large-datasets-with-virtualized-lists-70920e10da54)

**Why react-intersection-observer:**
- **Modern wrapper:** Clean React API around IntersectionObserver
- **Performance:** Lazy load collapsed sections only when user expands them
- **Browser support:** Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Bundle size:** Minimal overhead (~2KB gzipped)
- **Sources:** [Lazy Loading React Components](https://huzaima.io/blog/lazy-loading-react-components-intersection-observer), [LogRocket Guide](https://blog.logrocket.com/lazy-loading-using-the-intersection-observer-api/)

### Development Tools (Already in Place)

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9 | Linting | Already configured with flat config |
| Playwright | E2E testing | Already set up, add tests for analytics features |
| Firebase Tools | Local development | Already in use, emulators for testing |

## Installation

```bash
# Supporting libraries (ONLY IF virtualization needed)
npm install @tanstack/react-virtual

# Lazy loading (ONLY IF using collapsible sections)
npm install react-intersection-observer
```

**Important:** Don't install these unless you actually need them. Most analytics features can be built with pure React + Tailwind.

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Recharts, Chart.js, D3.js | Heavy bundle size (100KB+), overkill for grid-based visualizations, conflicts with DOOM retro aesthetic | Pure Tailwind CSS grids + custom React components |
| react-window | Older library, no longer actively maintained as of 2024, lacks TypeScript-first design | TanStack Virtual (only if virtualizing 100+ weeks) |
| react-chrono, react-timeline | Pre-built UI components that don't match DOOM aesthetic, bring unnecessary styling overhead | Custom collapsible component with Tailwind |
| Offset-based pagination | Reads all skipped documents (expensive, slow with Firestore) | Cursor-based pagination with startAfter() |
| Material-UI Timeline/Accordion | Heavy dependency (2MB+), Material Design conflicts with retro pixel theme | Headless patterns with custom Tailwind styling |

**Sources:**
- Chart libraries overhead: [React Chart Libraries 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries), [Embeddable Guide](https://embeddable.com/blog/react-chart-libraries)
- react-window deprecation: [TanStack Virtual announcement](https://conzit.com/post/understanding-tanstack-virtual-a-key-to-react-performance)
- Firestore pagination: [Firestore Best Practices 2026](https://estuary.dev/blog/firestore-query-best-practices/)

## Stack Patterns by Feature

### Pattern 1: Timeline with 100+ Weeks (Virtualization Required)

**When:** User has 2+ years of workout history (100+ week documents)

**Stack:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// Virtualize only visible months/years
const virtualizer = useVirtualizer({
  count: months.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200, // Estimated month section height
})
```

**Why:** Rendering 100+ week grids (7 cells each = 700+ DOM nodes) causes jank. TanStack Virtual renders only visible viewport + buffer.

**Performance impact:** 700+ DOM nodes → ~10-15 nodes (95% reduction)

**Sources:** [Virtualization Performance](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef), [React Performance 2026](https://www.zigpoll.com/content/how-can-i-optimize-the-responsiveness-and-performance-of-my-react-dashboard-when-rendering-large-datasets-with-dynamic-visualizations)

### Pattern 2: Collapsible Sections (Lazy Loading)

**When:** Timeline with year/month sections that can expand/collapse

**Stack:**
```typescript
import { useInView } from 'react-intersection-observer'

function MonthSection({ monthData }) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Load once when expanded
    threshold: 0.1,
  })

  return (
    <div ref={ref}>
      {inView && <WeekGrid weeks={monthData.weeks} />}
    </div>
  )
}
```

**Why:** Don't load week grids for collapsed months. Saves Firebase reads and rendering time.

**Performance impact:** Deferred rendering = faster initial load, lower Firebase costs

**Sources:** [Lazy Loading with Intersection Observer](https://dev.to/anxiny/easy-lazy-loading-with-react-intersection-observer-api-1dll), [HackerNoon Guide](https://hackernoon.com/how-to-lazy-load-react-components-with-an-intersection-observer)

### Pattern 3: Health Bar Color Scheme (Pure Tailwind)

**When:** Visualizing workout intensity (0-7 workouts per week)

**Stack:**
```typescript
// Color mapping (green = healthy, red = critical)
const healthBarColors = {
  0: 'bg-doom-red',      // Critical (0 workouts)
  1: 'bg-red-700',       // Hurt (1 workout)
  2: 'bg-orange-600',    // Damaged (2 workouts)
  3: 'bg-yellow-500',    // Healthy (3 workouts)
  4: 'bg-lime-500',      // Strong (4 workouts)
  5: 'bg-green-500',     // Godmode (5 workouts)
  6: 'bg-doom-gold',     // Ultra Godmode (6-7 workouts)
}
```

**Why:** Intuitive health metaphor (DOOM health bar), better than traffic lights. Green = good aligns with health/healing psychology.

**Accessibility:** Always pair with text labels (not color-only), use sufficient contrast ratios

**Sources:** [Health App Color Psychology](https://www.uxmatters.com/mt/archives/2024/07/leveraging-the-psychology-of-color-in-ux-design-for-health-and-wellness-apps.php), [UI Color Palette 2026](https://www.interaction-design.org/literature/article/ui-color-palette)

### Pattern 4: Trend Indicators (Custom React Component)

**When:** Showing "vs last period" and "vs average" comparisons

**Stack:**
```typescript
// Pure React component (no library needed)
function TrendIndicator({ current, previous }: { current: number, previous: number }) {
  const change = current - previous
  const percentage = previous > 0 ? ((change / previous) * 100).toFixed(1) : 'N/A'
  const isPositive = change > 0

  return (
    <div className="flex items-center gap-1">
      <span className={isPositive ? 'text-doom-green' : 'text-doom-red'}>
        {isPositive ? '↑' : '↓'}
      </span>
      <span className="text-sm">{Math.abs(change)} ({percentage}%)</span>
    </div>
  )
}
```

**Why:** Simple custom component is lighter than financial charting libraries (Syncfusion, Ignite UI would add 500KB+)

**Sources:** [React Trend Indicators](https://www.syncfusion.com/react-components/react-charts/technical-indicators) (what NOT to use), custom implementation recommended

### Pattern 5: Firestore Pagination (Cursor-Based)

**When:** Loading historical weeks beyond initial 12-week view

**Stack:**
```typescript
import { query, collection, orderBy, limit, startAfter, getDocs } from 'firebase/firestore'

async function fetchNextWeeksPage(lastDoc: DocumentSnapshot) {
  const q = query(
    collection(db, `users/${uid}/weeks`),
    orderBy('startDate', 'desc'),
    startAfter(lastDoc),
    limit(20) // Load 20 weeks (~5 months) per page
  )

  const snapshot = await getDocs(q)
  return snapshot.docs
}
```

**Why:** Cursor-based pagination is 10x cheaper than offset-based. Reading 100 docs with offset costs 100 reads; cursor costs 20 reads per page.

**Performance impact:** Lower Firebase costs, faster queries (no skipped document reads)

**Sources:** [Firestore Pagination Best Practices](https://estuary.dev/blog/firestore-query-best-practices/), [Firebase Official Docs](https://firebase.google.com/docs/firestore/query-data/query-cursors)

### Pattern 6: React Performance Optimization

**When:** Rendering large datasets with expensive calculations

**Stack:**
```typescript
import { useMemo, useCallback } from 'react'

// Memoize expensive calculations
const monthlyStats = useMemo(() => {
  return calculateMonthlyTotals(allWeeks) // Only recalc when allWeeks changes
}, [allWeeks])

// Memoize event handlers to prevent child re-renders
const handleToggleMonth = useCallback((monthId: string) => {
  setExpandedMonths(prev =>
    prev.includes(monthId)
      ? prev.filter(id => id !== monthId)
      : [...prev, monthId]
  )
}, [])
```

**Why:** useMemo prevents recalculating stats on every render. useCallback with functional updates avoids stale closures.

**When to use:** ONLY when profiling shows actual performance issues. Premature optimization adds complexity.

**Measurement first:** Use React DevTools Profiler to identify slow renders before adding memoization

**Sources:** [React Performance Optimization 2026](https://oneuptime.com/blog/post/2026-02-20-react-performance-optimization/view), [useMemo Guide](https://medium.com/@dilankajay/react-usecallback-and-usememo-explained-how-to-optimize-performance-without-overusing-hooks-e65eaf192f14), [Kent C. Dodds Guide](https://kentcdodds.com/blog/usememo-and-usecallback)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19.2 | TanStack Virtual ^3.10.0 | Fully compatible, TanStack uses React 16.8+ hooks |
| React 19.2 | react-intersection-observer ^9.13.0 | Fully compatible, uses standard hooks API |
| Tailwind 3.4 | All custom components | No compatibility issues with pure CSS utilities |
| Firebase 12.7 | Firestore cursor pagination | Built-in support, no additional packages |
| TypeScript 5.9 | All recommended libraries | TanStack Virtual is TypeScript-first |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| TanStack Virtual | React Virtuoso | If you need out-of-the-box support for grouped lists with sticky headers (TanStack requires more manual setup) |
| Custom Tailwind grids | Flowbite Timeline | If you want pre-built timeline components and don't mind Material Design aesthetic (conflicts with DOOM theme) |
| Pure React components | Headless UI Disclosure | If you want WAI-ARIA accessibility baked in for collapsible sections (worth considering for screen reader support) |
| Cursor-based pagination | Infinite scroll | If timeline is primary view and you want continuous scrolling (requires virtualization + intersection observer) |

**Sources:**
- React Virtuoso: [Optimizing Large Datasets](https://medium.com/@eva.matova6/optimizing-large-datasets-with-virtualized-lists-70920e10da54)
- Flowbite: [Tailwind Timeline Components](https://flowbite.com/docs/components/timeline/)
- Headless UI: [Disclosure Component](https://headlessui.com/react/disclosure) (not directly linked but industry standard)

## Stack Decision Matrix

| Feature | Light User (<52 weeks) | Power User (100+ weeks) | Implementation |
|---------|------------------------|-------------------------|----------------|
| Timeline rendering | Pure React + Tailwind | TanStack Virtual | Conditional: check weeks.length |
| Collapsible sections | Pure React state | Intersection Observer | react-intersection-observer |
| Color scheme | Tailwind utilities | Tailwind utilities | No library needed |
| Trend indicators | Custom component | Custom component | No library needed |
| Firebase queries | Direct getDocs() | Cursor pagination | Built-in Firestore |
| Performance | useMemo for stats | useMemo + virtualization | React built-in |

## Firebase Query Optimization Strategy

**Existing Data Structure:**
```
users/{uid}/weeks/{weekId}
  startDate: "2026-01-06"
  workouts: [true, false, true, ...]
  status: "normal"
```

**Query Pattern for Timeline:**
```typescript
// Initial load: Last 12 weeks (current Dashboard)
const recentWeeks = query(
  collection(db, `users/${uid}/weeks`),
  orderBy('startDate', 'desc'),
  limit(12)
)

// Expanded timeline: Load year on demand
const yearWeeks = query(
  collection(db, `users/${uid}/weeks`),
  where('startDate', '>=', '2025-01-01'),
  where('startDate', '<', '2026-01-01'),
  orderBy('startDate', 'desc')
)
```

**Index Requirements:**
- Composite index: `startDate (desc)` (already exists for current Dashboard)
- No new indexes needed (simple orderBy + limit)

**Cost Optimization:**
- Don't query all weeks on Dashboard load
- Load years lazily when user expands timeline
- Cache expanded years in component state (avoid re-querying)
- Use LocalStorage fallback for guest users (no Firebase reads)

**Sources:** [Firestore Limitations](https://estuary.dev/blog/firestore-limitations/), [Query Cursors Guide](https://firebase.google.com/docs/firestore/query-data/query-cursors)

## Mobile-First Considerations

**Accordion/Collapsible Pattern:**
- Native `<details>` element is most performant (no JS needed)
- However, limited styling options for DOOM aesthetic
- **Recommendation:** Custom React component with Tailwind for full control
- Touch targets: Minimum 44px height for mobile tap areas
- Collapse by default on mobile, expand on desktop (responsive design)

**Performance on Mobile:**
- Virtualization is critical for mobile (less RAM, slower CPU)
- Lazy loading saves mobile data (don't load collapsed sections)
- Use `content-visibility: auto` CSS for off-screen rendering optimization

**Sources:**
- [React Accordion Performance](https://mui.com/material-ui/react-accordion/) (unmountOnExit pattern)
- [Mobile Accordion Patterns](https://demo.mobiscroll.com/react/collapsible/accordion)

## Accessibility Requirements

**Color Contrast:**
- WCAG 2.1 Level AA requires 4.5:1 contrast ratio for text
- Health bar colors must include text labels (not color-only)
- Test with browser DevTools accessibility checker

**Keyboard Navigation:**
- Collapsible sections: Space/Enter to toggle
- Timeline navigation: Arrow keys for next/previous month
- Focus indicators: Visible outline on all interactive elements

**Screen Readers:**
- Use `<button>` elements for expand/collapse (not `<div>` with onClick)
- ARIA labels: `aria-expanded="true/false"` on collapse buttons
- Announce trend changes: "Workouts increased by 3 compared to last month"

**Sources:** [UI Color Palette Best Practices](https://www.interaction-design.org/literature/article/ui-color-palette), [Healthcare Color Accessibility](https://www.uxmatters.com/mt/archives/2024/07/leveraging-the-psychology-of-color-in-ux-design-for-health-and-wellness-apps.php)

## Testing Strategy

**Unit Tests (Recommended: Vitest):**
- Test calculation functions (monthly/yearly aggregations)
- Test trend indicator logic (positive/negative changes)
- Test color mapping (workout count → health bar color)
- Mock Firestore queries for hook testing

**E2E Tests (Existing: Playwright):**
- Test timeline expansion/collapse
- Test lazy loading (verify no Firebase reads until expand)
- Test virtualization scroll performance
- Test accessibility (keyboard navigation, ARIA labels)

**Performance Benchmarks:**
- Measure initial render time with 100+ weeks
- Measure scroll FPS with virtualization
- Measure Firebase read counts per user action
- Target: <100ms for expand/collapse, 60 FPS scrolling

## Sources Summary

**High Confidence (Official Docs, 2026 Sources):**
- [Firestore Query Best Practices 2026](https://estuary.dev/blog/firestore-query-best-practices/)
- [React Performance Optimization 2026](https://oneuptime.com/blog/post/2026-02-20-react-performance-optimization/view)
- [useMemo/useCallback Guide January 2026](https://medium.com/@dilankajay/react-usecallback-and-usememo-explained-how-to-optimize-performance-without-overusing-hooks-e65eaf192f14)
- [TanStack Virtual Guide](https://conzit.com/post/understanding-tanstack-virtual-a-key-to-react-performance)
- [UI Color Palette 2026](https://www.interaction-design.org/literature/article/ui-color-palette)

**Medium Confidence (Industry Guides, 2025-2026):**
- [Lazy Loading with Intersection Observer](https://blog.logrocket.com/lazy-loading-using-the-intersection-observer-api/)
- [React Virtualization Performance](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef)
- [Health App Color Psychology](https://www.uxmatters.com/mt/archives/2024/07/leveraging-the-psychology-of-color-in-ux-design-for-health-and-wellness-apps.php)
- [Tailwind Timeline Components](https://flowbite.com/docs/components/timeline/)

**Reference (Context for Avoidance):**
- [React Chart Libraries 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries) (what NOT to use)
- [React Accordion Libraries](https://mui.com/material-ui/react-accordion/) (pattern examples)

---
*Stack research for: Rep & Tear Enhanced Analytics*
*Researched: 2026-02-25*
*Confidence: HIGH (verified with 2026 sources, existing tech stack, Firebase best practices)*
