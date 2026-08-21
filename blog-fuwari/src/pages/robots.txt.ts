import type { APIRoute } from "astro";

const siteRoot = new URL(import.meta.env.SITE);
const blogRoot = new URL(import.meta.env.BASE_URL, siteRoot);
const sitemapUrl = new URL("sitemap-index.xml", blogRoot);

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${sitemapUrl.href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
