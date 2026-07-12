# Frontend UI/UX Specification

## App shell

Desktop uses a collapsible left sidebar and top bar with global search, notifications, theme switch, and profile menu. Mobile uses slide-over navigation and sticky primary actions. Use a neutral slate canvas, white or dark-slate cards, blue primary actions, and restrained glass effects only on overlays.

## Screens

| Area | Experience |
| --- | --- |
| Dashboard | KPI cards, trip/fuel/expense charts, alerts, recent trips, fleet and driver availability |
| Vehicles & drivers | Searchable, sortable sticky-header tables; status chips; detail drawers; document expiry alerts |
| Trips | Timeline-aware detail page, dispatch wizard, route metrics, clear irreversible-action confirmation |
| Maintenance/fuel/expenses | Filterable operational logs, cost summaries, create/edit sheets |
| Reports | Date-range filters, saved views, chart/table toggle, CSV/PDF export |
| Settings | Profile, password, notification preferences, organization controls |

## Component system

Build reusable `DataTable`, `StatusBadge`, `MetricCard`, `PageHeader`, `EmptyState`, `ConfirmDialog`, `FileUploader`, `DateRangeFilter`, and `FormField` components. Forms use React Hook Form and inline error text; mutations show loading states and toast feedback.

## Responsive and accessible behavior

Support keyboard navigation, visible focus rings, semantic controls, `aria-live` form errors, and color-independent status labels. Tables convert low-priority columns into detail drawers below tablet width. Respect `prefers-reduced-motion`; Framer Motion transitions should be short and never block input.
