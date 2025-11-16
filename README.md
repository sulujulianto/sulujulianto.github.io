# 🌐 Sulu Edward Julianto — Personal Portfolio

This repository powers **sulujulianto.github.io**—a multi-language personal portfolio currently deployed via GitHub Pages.  

> 🎯 Goal: deliver a fast, responsive, and maintainable profile that still feels professional to fellow developers.

---

## ✨ Key Features

- **Full locale coverage** (ID / EN / JA / ZH) with dedicated project & certificate data per language.
- **Project & certificate vaults** with modal detail views, featured highlights, and optional hi-res assets.
- **Dark/light theme**, subtle animations, and responsive grids optimized for desktop & mobile.
- **Static blog** for Markdown-based posts.
- **Contact section** using FormSubmit plus direct channels (email/phone/Telegram) for mobile users.

---

## 🗂 Project Structure

```
.
├── assets
│   ├── css          # Tailwind entry (main.css) + modal styling
│   ├── js           # React widgets + compiled dist/app.js
│   └── data
│       ├── projects/projects-<locale>.json
│       ├── certificates/certificates-<locale>.json
│       └── categories/
│           ├── projects/<locale>.json
│           └── certificates/<locale>.json
├── <locale>/index.html  # Locale-specific landing pages
└── blog/                # Static blog page
```

Tips:
- Add or edit projects/certificates by updating the JSON files.  
- Use `fullImageUrl` on certificates to open high-res versions in new tabs without bloating the main grid.  
- `assets/js/dist/app.js` is generated from `assets/js/app.tsx` so that GitHub Pages serves a plain JS bundle (no runtime Babel).

---

## 🛠 Tech Stack

- HTML5, CSS3, Tailwind CSS
- TypeScript + React 18 (rendered via `dist/app.js`)
- PostCSS / Autoprefixer
- FormSubmit (contact form integration)
- GitHub Pages (current hosting; easily migratable)

---

## 🚀 Local Development

```bash
npm install            # install dev dependencies
npm run tailwind:build # regenerate assets/css/output.css
npm run ts:build       # compile assets/js/dist/app.js
npm run dev            # or use Live Server/http-server for preview
```

> When migrating to a custom domain or another hosting provider, keep relative paths (`../`) consistent or adjust build tooling accordingly.

---

## 📬 Contact

- Email: [sulucodes@gmail.com](mailto:sulucodes@gmail.com)  
- LinkedIn: [linkedin.com/in/sulujulianto](https://linkedin.com/in/sulujulianto)  
- GitHub: [github.com/SuluJulianto](https://github.com/SuluJulianto)

---

Designed & maintained by **Sulu Edward Julianto**.
