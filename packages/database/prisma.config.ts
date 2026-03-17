import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: { path: "prisma/migrations" },
	datasource: {
		url:
			process.env.NODE_ENV === "production"
				? env("POSTGRES_URL_NON_POOLING")
				: env("POSTGRES_URL"),
	},
});
