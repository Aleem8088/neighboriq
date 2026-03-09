"use server";

import { seedDatabase } from "../../lib/seed";

export async function triggerDatabaseSeed() {
    await seedDatabase();
}
