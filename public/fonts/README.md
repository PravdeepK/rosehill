# Brand Fonts

This folder holds the licensed Rose Hill brand fonts. They are loaded via
`@font-face` rules in `app/globals.css`.

## Required files

When you download the web kits from your MyFonts account, drop the files here
with these exact filenames so the CSS picks them up automatically:

| Font (MyFonts product) | Required filename |
| ---------------------- | ----------------- |
| AndrewAndreas Black (Ingrimayne Type) | `AndrewAndreas-Black.woff2` |
| AndrewAndreas Black (Ingrimayne Type) | `AndrewAndreas-Black.woff`  *(optional fallback)* |
| Schramberg Sans Regular (Runsell Type) | `SchrambergSans-Regular.woff2` |
| Schramberg Sans Regular (Runsell Type) | `SchrambergSans-Regular.woff` *(optional fallback)* |

If MyFonts gives you files with different names (e.g.
`AndrewAndreas-Black.woff2` arrives as something like
`andrewandreas_black-webfont.woff2`), just rename them to match the table
above.

## Notes on the kit

A MyFonts web kit usually ships as a zip containing:

- `.woff2` (modern, smallest — required)
- `.woff` (older browser fallback — optional but recommended)
- A `webfontkit.css` file (you can ignore this — our `globals.css` already has
  the `@font-face` declarations wired up)
- A license / EULA file — keep this somewhere safe outside the repo

## License

These fonts are commercial. Do **not** redistribute the source files outside
this project. The web license covers serving them on Rose Hill Design Build's
production domain only.
