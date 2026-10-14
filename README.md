# Simo — portfolio

Live at **https://semo-el.github.io/Humble_Portfolio/**

A single static page: plain HTML, CSS and JavaScript. No framework, no build step, nothing to install.
GitHub Pages serves the files exactly as they are.

## Files

```
index.html     all the content: hero, projects, case studies, story, skills, contact
style.css      design tokens (colours, fonts) at the top, then layout and components
script.js      theme toggle, project deck, case-study dialogs, scroll reveals, video
favicon.svg
images/        screenshots (.webp), the SIA teaser clip (.mp4) and the share image (og-image.png)
explainers/    live interactive figures, each a self-contained page shown in an <iframe>
```

## Deploy (replace the old site)

From a clone of the `Humble_Portfolio` repository:

```bash
git rm -r --quiet .                      # remove the old files (history keeps them)
# copy everything from this folder into the repo folder, then:
git add -A
git commit -m "Portfolio v3: new design, SimoAI, Ironline, SIA films and more"
git push
```

GitHub Pages rebuilds in about a minute. If Pages isn't already on, enable it under
**Settings → Pages → Deploy from a branch → main / (root)**.

## Editing

- **Text:** everything is in `index.html`. Each project in *Selected work* is an `<article class="case">`,
  and its full case study is a `<dialog id="cs-…">` near the bottom of the file.
- **Colours and fonts:** the variables at the top of `style.css` (`--accent`, `--bg`, …). The light theme
  overrides are right below them.
- **Add a project card:** copy one `<article class="card">` in the *More work* grid. Use WebP screenshots
  around 1600 px wide to keep the page fast.
- **Live figures:** `explainers/differential.html` is generated, not hand-edited. Rebuild it from
  `Downloadsdifferential` with `node build.mjs --embed` and copy `differential-embed.html` over it.
  The page sends it the theme on toggle and it reports its height back (`script.js`, "live figures").
- **Deep links:** `#case/simoai`, `#case/ironline`, `#case/archaeosmart`, `#case/workspace`,
  `#case/posesandbox` and `#case/svvvd` open a case study directly.

## Notes

- The page respects *reduced motion* settings and works without JavaScript (case studies then simply stay closed).
- Screenshots of SimoAI, Ironline, Mana Vessel, Evenly and Vector Strike were captured from the local
  builds; the SIA clip and stills are cut from the 98-second film and show no faces or names.
