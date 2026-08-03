/**
 * The schema declares plain text primary keys with no database-side default,
 * so ids are minted by the business layer.
 *
 * UUID v7 is time-ordered: ids sort chronologically, which keeps primary-key
 * inserts sequential and makes `ORDER BY id` a usable proxy for insert order.
 */
export const newId = (): string => Bun.randomUUIDv7();
