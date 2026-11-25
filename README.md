# Responsive Internship Board

A framework-free, accessible internship listing interface (HTML + CSS + vanilla JS).
Works at 360px, 768px and desktop widths with no horizontal scrolling.

**Live preview:** `https://<your-username>.github.io/<repo-name>/`
**Task:** EdVyro · Full Stack Development · Task 1

## Features
- Reusable card rendering from `data/internships.json` (supplied seed, IDs preserved)
- Search (title, skill, location, domain, mode) + Domain and Work-mode filters
- Loading, empty, error and **Retry** states (add `?fail=1` to the URL to demo the error state)
- "View details" dialog and "Apply" form with validation: required name, valid email,
  https-only portfolio URL, duplicate-application check
- Accessibility: semantic landmarks, skip link, labelled inputs, `aria-live` status,
  `aria-invalid` + error text, native `<dialog>` (focus trap, Esc to close, focus returns to trigger),
  visible focus rings, 44px touch targets, `prefers-reduced-motion`, dark mode
- No logging of personal data; applications are stored only in the browser's localStorage (demo)

## Run locally
`fetch()` needs a server (not `file://`):
```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)
Repo → Settings → Pages → Deploy from branch → `main` / root.

## Page structure
```
index.html   semantic layout: header, filter form (role=search), results, dialog
styles.css   mobile-first; breakpoints 768px (2 cols) and 1024px (3 cols)
app.js       load → filter → render cards → dialog → form validation
data/internships.json
docs/        screenshots + test notes
```

## Responsive test results
| Width | Layout | Horizontal scroll | Notes |
|---|---|---|---|
| 360px | 1 column, stacked filters | None | Buttons wrap, text wraps |
| 768px | 2 columns, inline filters | None | |
| 1280px | 3 columns | None | |

(Add screenshots to `docs/` and link them here: `![360px](docs/360.png)`)

## Keyboard test
Tab order: skip link → search → domain → mode → clear → card buttons → dialog (trapped) → form.
Esc closes the dialog and returns focus to the button that opened it.

## Notes / limitations
This submission is the front-end task (checklist items 1–4). The product brief also mentions a
server API (status/data/pagination envelope, server-side validation, logging rules). Validation here
is client-side only; a Node/Express API can be added as a next step.
