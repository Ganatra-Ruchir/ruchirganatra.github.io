# Portfolio — Client Studio V2

Release date: 12 October 2026.

## User-facing features

1. Search project problems, tools and deliverables.
2. Filter projects by Data, AI or Security.
3. Shortlist relevant work.
4. Show shortlisted projects only.
5. Compare shortlisted project problems and deliverables.
6. Choose from four service types.
7. See service-specific suggested deliverables.
8. Build a brief from outcome, input format and preferred timing.
9. Select service-specific acceptance criteria.
10. Check three essentials for a useful brief.
11. Save, restore and clear a local draft.
12. Generate and copy a structured brief.
13. Download the brief as Markdown.
14. Open a prefilled email enquiry for a brief that fits a mailto link.

## Use and limits

Open index.html via an HTTP server and use Plan a project. No message is sent automatically. Saving a draft is explicit and uses this browser’s local storage. Price and delivery dates are not quoted or guaranteed. Long briefs are copied/downloaded instead of silently truncated into mailto links. Existing project history and professional claims are unchanged.

## Interface and reliability

Responsive layouts, keyboard focus, lightweight CSS animation with a pause control, and operating-system reduced-motion support. Browser checks cover representative workflows, download events, reload persistence where applicable, JavaScript errors and mobile overflow. Passing these checks is not a guarantee of zero defects.

## Verification

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

