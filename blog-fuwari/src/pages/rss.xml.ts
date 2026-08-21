import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { getPostSlug, url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const siteRoot = context.site ?? new URL("https://sulujulianto.github.io/");
	const blogRoot = new URL(url("/"), siteRoot);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: blogRoot,
		items: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${getPostSlug(post.id)}/`),
				// Gambar relatif milik Astro tidak mempunyai URL stabil di feed.
				// Hapus tag gambar agar pembaca RSS tidak menerima tautan rusak.
				content: sanitizeHtml(parser.render(cleanedContent)),
			};
		}),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
