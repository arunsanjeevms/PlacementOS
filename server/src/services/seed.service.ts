import { logger } from "../utils/logger.js";

/**
 * Seeds the default data a brand-new user should start with (tracker topics,
 * starter companies, etc.). Each module registers its seeder here as it is built,
 * so registration stays in one place and runs inside a single call at sign-up.
 */
type Seeder = (userId: string) => Promise<void>;

const seeders: Seeder[] = [];

export function registerSeeder(seeder: Seeder): void {
  seeders.push(seeder);
}

export async function seedUserDefaults(userId: string): Promise<void> {
  await Promise.all(
    seeders.map((seed) =>
      seed(userId).catch((err) => logger.error("Seeder failed", err))
    )
  );
}
