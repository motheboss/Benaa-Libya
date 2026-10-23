import "server-only";

type Res<T> = { data: T | null; error: { message: string } | null };

/** Throws on error, returns [] / null when empty. */
export function rows<T>(res: Res<T[]>): T[] {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

export function one<T>(res: Res<T>): T | null {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? null;
}
