import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Sulu Edward Julianto",
	subtitle: "Blog",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	// Banner blog, aman dipakai di GitHub Pages karena path dari /public.
	banner: {
		enable: true,
		src: "/assets/images/banner.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "Key 20th anniversary celebration", // Credit text to be displayed
			url: "https://key.visualarts.gr.jp/", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	// Favicon dari /public supaya aman di base /blog/.
	favicon: [
		{ src: "/favicon/icon.png", theme: "light", sizes: "32x32" },
		{ src: "/favicon/icon.png", theme: "dark", sizes: "32x32" },
	],
};

export const navBarConfig: NavBarConfig = {
	// Urutan link navbar, bisa ditambah/kurangi sesuai kebutuhan.
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "Portfolio",
			url: "https://sulujulianto.github.io/",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/assets/images/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Sulu Edward Julianto",
	bio: "Software Engineer & Full Stack Developer. Building scalable and functional web application systems.",
	// Sosial media yang tampil di profil (ikon dari https://icones.js.org/).
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github", // Visit https://icones.js.org/ for icon codes
			url: "https://github.com/sulujulianto",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:sulucodes@gmail.com",
		},
		{
			name: "LinkedIn",
			icon: "fa6-brands:linkedin",
			url: "https://www.linkedin.com/in/sulujulianto",
		},
		{
			name: "Telegram",
			icon: "fa6-brands:telegram",
			url: "https://t.me/sulucodes",
		},
		{
			name: "Mastodon",
			icon: "fa6-brands:mastodon",
			url: "https://mastodon.social/@sulujulianto",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
