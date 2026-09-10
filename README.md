# Jerwin Babatugon — Portfolio

Personal portfolio: **Software Developer & AI Automation Builder**.

Static site — plain HTML, CSS and JavaScript, no build step. Deployed with GitLab
Pages at <https://zymith1234.gitlab.io/jerwin-full-stack-dev/>.

## Structure

```
public/
  index.html                     Home (single-page scroll)
  automation/index.html          AI automation landing page
  projects/
    attendance-management-system/
    budget-tracking-app/
    job-discovery-automation/     (in development)
    course-booking-app/
  404.html
  robots.txt · sitemap.xml · site.webmanifest
  assets/
    css/styles.css               One stylesheet: tokens → base → components → sections
    js/main.js                    Nav, theme toggle, scrollspy, reveal, contact form
    img/icons.svg                 Inline SVG icon sprite (referenced via <use>)
    fonts/inter-variable.woff2    Self-hosted Inter (SIL OFL 1.1, see OFL.txt)
    cv/Jerwin-Babatugon-CV.pdf
```

## Local preview

No dependencies. Serve `public/` with any static server:

```bash
cd public
python -m http.server 8080
# open http://localhost:8080/
```

## Deploy

Push to `master`. `.gitlab-ci.yml` publishes `public/` as the Pages artifact — there
is no build stage.

## Notes

- Theme: dark by default; light theme via the toggle; choice persisted in `localStorage`.
- Contact form posts to [Web3Forms](https://web3forms.com/) (public access key).
- Icons: [Lucide](https://lucide.dev/) (ISC), bundled into `assets/img/icons.svg`.
- Font: [Inter](https://rsms.me/inter/) (SIL Open Font License 1.1).
