import { db } from '~shared/db'
import { users } from '~shared/schema'
import { sql } from 'drizzle-orm'

export async function chargeAndPatch(job) {
    const { userId } = job
    const [{ credits }] = await db.execute(sql`
    UPDATE users
    SET credits = credits - 1
    WHERE id = ${userId} AND credits > 0
    RETURNING credits
  `)

    if (credits === undefined) throw new Error('NO_CREDITS')

    /* …call GPT-4o-mini and finish job… */
}

export default async function gpt() {}
