const userAgent = process.env.npm_config_user_agent ?? "";

if (!userAgent.startsWith("pnpm/")) {
	console.error(
		"Gunakan pnpm 11 melalui Corepack: corepack enable && pnpm install --frozen-lockfile",
	);
	process.exit(1);
}
