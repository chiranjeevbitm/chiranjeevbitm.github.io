# chiranjeevbitm.github.io

Published at https://chiranjeevbitm.github.io/

## What is here

`index.html` is **Night Shift**, an interactive 3D walkthrough of the plan for a
personal always-on agent built on Claude Code: research findings, three build
paths, architecture, skills and tools, hosting options, a phased build plan and
the first commands.

- `index.html` holds the page: markup, styles and script in one file
- `assets/vendor/three.min.js` is three.js r187, bundled into one file (MIT, see `three.LICENSE`)
- `assets/fonts/` holds Fraunces, Hanken Grotesk and JetBrains Mono (SIL Open Font License)
- `.nojekyll` tells GitHub Pages to serve the files as they are

## Adding more pages

Give each new page its own folder so pages never overwrite each other:

```
/index.html                  the current front page
/<page-name>/index.html      served at https://chiranjeevbitm.github.io/<page-name>/
```

Commit to `master` and GitHub Pages publishes it within a minute or two.

## The old site

The portfolio and blog pages that used to live here were removed from `master`
on 14 November 2026. They are kept, unchanged, on the branch
`archive/old-portfolio-2026-11-14`. To bring them back:

```
git checkout archive/old-portfolio-2026-11-14 -- .
```
