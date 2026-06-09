import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: any = null;

function getSql() {
  if (!sql) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL env degiskeni tanimli degil");
    }
    sql = neon(DATABASE_URL);
  }
  return sql;
}

export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const client = getSql();
  return client(strings, ...values) as Promise<T[]>;
}

export function isNeonAvailable(): boolean {
  return !!DATABASE_URL;
}
