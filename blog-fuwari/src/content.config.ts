import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const markdownId = ({ entry }: { entry: string }) =>
	entry.replace(/\.(md|mdx)$/i, "");

const postsCollection = defineCollection({
	loader: glob({
		pattern: "**/[^_]*.{md,mdx}",
		base: "./src/content/posts",
		generateId: markdownId,
	}),
	schema: z.object({
		title: z.string().trim().min(1),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string().trim().min(1)).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.enum(["id", "en", "ja", "zh"]).optional().default("id"),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const specCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/spec",
		generateId: markdownId,
	}),
	schema: z.object({}),
});

export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
