import { Platform } from "./platform.model";

export async function listPlatforms() {
  const platforms = await Platform.find({ isActive: true }).sort({ name: 1 });
  return platforms.map((p) => ({ id: p.id, name: p.name, slug: p.slug }));
}