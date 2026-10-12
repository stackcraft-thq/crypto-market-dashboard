# Assessment review

Reviewed on October 12, 2026, against the supplied Yaama Tech Frontend Developer assessment. Implementation reviewed at commit `8bff547`.

## Verdict

All six mandatory implementation requirements are covered and passed the checks below. Two optional bonuses are implemented: light/dark themes and tests. No missing mandatory functionality was found in this review. Submission is not complete: this checkout has no configured GitHub remote, and a public repository link still needs to be supplied.

This is a requirements and implementation review, not a guarantee of an interview result or a complete production certification.

## Mandatory requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| Fetch top 20 with caching and error handling | Meets | `api/coins.ts` uses the exact supplied endpoint. `hooks/use-market.ts` has a stable query key, 2-minute freshness, 15-minute inactive cache retention, cancellation, reconnection, and limited retries. Runtime JSON validation and HTTP/network messages are separate. |
| Responsive card grid | Meets | CSS uses 1 column below 640px, 2 from 640px, 3 from 1024px, and 4 from 1200px. Browser tests check column counts and horizontal overflow at 390, 820, 1100, and 1440px. |
| Icon, name, symbol, USD price, signed 24h change | Meets | `coin-card.tsx`, `coin-icon.tsx`, and `percentage-change.tsx` render all required fields, image fallback, green positive/red negative styling, and signs/arrows. Formatting covers tiny prices and unavailable values. |
| Search by name or symbol | Meets | `utils/filter-coins.ts` matches names/symbols case-insensitively and trims search whitespace. Unit/component/browser coverage confirms local filtering and clearing empty results. |
| Price/change ascending and descending sort | Meets | All four required sort directions plus default market-cap ordering are available. Sorting does not mutate cached data; unknown numeric values sort last. All directions are tested. |
| Loading, API error/retry, empty search, network recovery | Meets | Skeletons, initial errors, empty search/API states, background-error retention, offline notices, and reconnection are implemented. API, component, and browser tests exercise these flows. Manual actions share a burst guard; 429 responses use a server-aware cooldown. |

Market paths above are relative to `src/features/market/`.

## Optional bonuses

| Bonus | Status |
| --- | --- |
| Pagination/infinite scroll | Not implemented; not mandatory. The required top-20 dataset is displayed in one grid. |
| Detail page with a price chart | Not implemented; not mandatory. |
| Dark/light toggle | Implemented, persisted, responsive to initial system preference, and tested. |
| Tests | Implemented: 46 unit/component tests and 23 production browser tests passed in this review. |

Additional requested features include configurable auto-update, a manual-refresh cooldown, and reusable styled dropdowns. These do not replace or remove required assessment behavior. Auto-update downloads snapshots at 1-, 2-, or 5-minute intervals; a streaming feed is not required by the assessment.

## Evaluation criteria

- **Structure:** feature folders separate API access, hooks, types, components, utilities, and styles. Formatting, page components, and the dropdown are shared where appropriate.
- **TypeScript:** strict checking is enabled, remote response fields are modeled in a dedicated interface, and incoming data is validated from `unknown`. No application `any` types or fabricated runtime fixtures were found.
- **Fetching:** freshness, retention, retry, timeout, offline, background refresh, and rate-limit behavior are explicit and documented. Data remains visible during refetch and after refresh errors.
- **Responsive design:** automated breakpoint and overflow checks pass; desktop/mobile screenshots were visually inspected. The README screenshots were refreshed to show the current controls.
- **Edge cases:** null/invalid data, empty results, broken images, API errors, connectivity failures, and retry flows have implementation coverage. Automated tests cover the main recovery flows.
- **Git history:** eight meaningful local implementation/documentation commits existed at the start of this review; no history was rewritten. Documentation from this review is a separate commit.
- **Quality:** focused reusable components and pure utilities support readable separation of concerns. Technical decisions document why pagination, routing, a global state library, and historical charts are outside the current scope.

## Verification performed

- `npm run check`: TypeScript, ESLint, 46 unit/component tests, and production build all passed.
- `npm run test:e2e`: 23 Chromium production browser tests passed, including response recovery, rate limiting, interval selection, both themes, dropdown keyboard behavior, responsive layouts, and accessibility checks.
- Full-page Axe checks pass for the closed dashboard in both themes; the open dropdown is scanned separately, with focus trapping, Escape, and outside dismissal verified by interaction tests. This is not a full screen-reader audit.
- An unmocked live-browser check loaded 20 CoinGecko cards with no JavaScript page errors. A successful check does not guarantee future third-party availability.
- Git diff checks passed. Local environment files, dependencies, build output, and test output are ignored.

Checks ran locally on Windows with Node 26. The GitHub Actions workflow is prepared but has not been executed for this unpublished checkout. Safari, Firefox, and a manual screen-reader review remain unverified.

## Remaining submission steps

1. Create a public GitHub repository and push the committed project, README, and lockfile.
2. Check that the repository is publicly accessible and its verification workflow passes.
3. Share its URL with the recruiter before the technical interview.

The earlier instruction to wait for explicit publication authorization still applies; this review does not publish the repository.

For the interview, explain caching versus polling, local immutable filtering/sorting, nullable data handling, external API reliability, and why the optional chart/pagination scope was omitted. See [technical decisions](technical-decisions.md).
