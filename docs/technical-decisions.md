# Technical decisions and interview notes

## Scope

CoinScope implements every required assessment feature and two bonuses: persisted themes and automated tests. The interface uses the required top-20 USD market endpoint. No historical chart or pagination is included: neither improves the core 20-item browsing task enough to justify a second endpoint, routing, and additional rate-limit handling in this scope.

## State and architecture

React handles the UI, TypeScript checks contracts, and Vite provides development and production builds. TanStack Query owns the asynchronous market snapshot; search and sort are local React state. Query state is never copied into a second source of truth. Pure utilities transform data and are independently tested.

The feature folders keep types, API access, hooks, components, utilities, and styles together. Shared formatting and page components live outside the feature. Plain CSS with theme variables avoids a UI framework while preserving a consistent visual system. Lucide provides consistent SVG icons; Fontsource packages serve fonts locally. A shared dropdown wraps Radix Select for styled menus, focus management, keyboard selection, and popover positioning, avoiding a custom implementation of the ARIA interaction model.

**Discussion point:** A global state library would add complexity without solving a problem in a single-page dashboard. For 20 coins, local filtering is immediate and does not need debouncing or virtualization.

## API boundary

`Coin` models the fields this UI consumes, rather than every optional CoinGecko response field. Incoming JSON starts as `unknown` and is checked at runtime, because TypeScript cannot guarantee a remote server's response. Extra API fields are allowed; malformed required fields and duplicate identifiers are rejected. Missing numeric data remains `null`.

Fetch receives the query's cancellation signal plus a 15-second timeout. HTTP errors are mapped to messages; connection failures are distinguished from invalid data. No API key is embedded and no fabricated fallback is served.

**Discussion point:** Manual validation is adequate for this small, stable contract. A schema library becomes attractive when the API surface grows and validation needs to be shared across many endpoints.

## Cache and retry policy

The fixed query key includes endpoint purpose, quote currency, and dataset scope. Successful data is fresh for two minutes; inactive cached data remains in memory for 15 minutes. These are separate concepts: freshness determines background requests, while retention determines eviction after the query is unused.

Polling is off by default. An accessible auto-update switch opts into fresh snapshots at a selected 1-, 2-, or 5-minute interval (default: 1 minute) via TanStack Query's `refetchInterval`. Polling only runs while online and visible; it uses the existing query key and retains search, sort, and cards. Returning focus to the tab does not itself cause a request. Reconnection refetches stale data or resumes paused requests. The user can manually refresh; a refresh in progress is not canceled and restarted by repeated button clicks. TanStack Query shares a request between active observers. React Strict Mode may cancel and restart the initial request in development; the production browser suite verifies production request behavior.

Transient connection and server failures receive at most two retries, after one and two seconds. Client errors and invalid payloads do not retry automatically. A 429 creates a cooldown of at least 60 seconds; longer `Retry-After` seconds or HTTP dates take precedence. Both the UI and API layer prevent another request during that deadline. Enabled auto-update schedules its next attempt no sooner than the cooldown deadline; other errors pause polling until recovery. With auto-update off, manual retry is available after cooldown. Reloading the page resets this in-memory cooldown and cache.

**Discussion point:** Browser-only fetching is simple and appropriate here. A production service with many users would benefit from a shared server cache and centralized rate-limit handling. Never expose a private API key in a browser environment variable.

Manual refresh and retry actions share a 60-second burst guard. A synchronous ref blocks duplicate clicks even before React renders a disabled button; state supplies the visible countdown. Longer server cooldowns still win. This is a client-side UX safeguard, not a guarantee against shared-IP limits. Browser fetch failures do not always reveal an HTTP status, especially when cross-origin error responses omit CORS headers, so the generic message lists possible causes without claiming a confirmed rate limit or broken internet connection.

## Honest data presentation

Search matches substrings in names and symbols, case-insensitively, after trimming whitespace. Sorting uses a new array, keeps null values last in either direction, and breaks ties by name.

Overview totals refer to the fetched dataset, not the entire crypto market or the filtered search results. If a market cap or volume is missing, the aggregate is unavailable instead of silently incomplete. The rising-coins denominator includes only coins with a known 24-hour change. “Best performer” remains accurate even when all changes are negative.

A compact breadth bar visualizes the rising/falling split from the same snapshot. Unchanged and unavailable values have separate segments and textual counts; they are never counted as rising or falling. Larger card prices and labels improve scanability, and long best-performer names wrap rather than disappearing on narrow screens.

Prices use USD grouping and adaptive decimal precision; extremely tiny values use scientific notation. Sub-0.01% changes keep their direction rather than showing a misleading zero. Zero and unavailable values have distinct neutral presentation.

The update timestamp indicates the last successful download in the viewer's local time, not the underlying trade time or CoinGecko's individual `last_updated` fields. A snapshot becomes marked as refreshable after two minutes. It is never presented as a streaming feed.

## UX and recovery

Initial loading uses card skeletons; background loading retains cards and disables refresh. Initial errors provide a retry action; refresh errors preserve the last snapshot and display an outdated-data warning. An offline browser receives a notice and reconnects automatically. A browser may report “online” without actually reaching the internet, so fetch error handling is still necessary.

The theme starts from the system preference, persists explicit choices, follows system changes until chosen, and responds to storage changes across tabs. An early inline bootstrap prevents a flash of the wrong theme. An in-memory fallback keeps the toggle usable if storage is blocked.

The grid uses one column below 640px, two from 640px, three from 1024px, and four from 1200px. Overview tiles remain in two columns on narrow screens to keep the summary compact. Semantic landmarks, labeled search and dropdown controls, status announcements, text signs, visible focus, and reduced motion support make the interface more accessible.

## Verification

Vitest covers formatting, all sort directions, search, data validation, summaries, retries, and dashboard states. Requests are mocked. Playwright builds and tests production assets, checks column counts and horizontal overflow at four widths, verifies keyboard navigation and theme persistence, and exercises error, rate-limit, refresh, and offline recovery. Browser screenshots are retained in ignored test output for inspection. A separate manual live smoke check confirms the actual public API works without making the automated suite depend on it.

Both themes also pass automated Axe checks for WCAG A/AA rules. That provides useful regression coverage, but screen-reader and broader manual audits remain future work.

## Improvements with more time

1. Add a detail route and an accessible historical chart backed by real history, with its own rate-limit-aware query.
2. Introduce a server cache if traffic, authentication, or API keys warrant it.
3. Expand browser coverage to Firefox and Safari and perform a screen-reader review.
4. Add URL-persisted search/sort for sharing filtered views, and locale/currency preferences.
5. Add opt-in cache persistence with explicit age and provenance labels, rather than silently restoring old prices.
