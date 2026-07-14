# Switch Default Theme to Dark

Change the app's default theme from light to dark so it loads in dark mode on first visit. The existing Sun/Moon toggle in the top-right corner remains functional — users can still switch back to light mode.

## Change

In `src/App.tsx`, update the `ThemeProvider` config:

- `defaultTheme="light"` → `defaultTheme="dark"`

That's the only change needed. All dark-mode CSS tokens (`.dark` variables in `src/index.css`) and Tailwind's `darkMode: ["class"]` config are already in place, so every page, card, map panel, and dialog will automatically render in dark mode.
