 // export default async function scan() {}

 export default <ExportedHandler<{ SCAN_Q: Queue; GPT_Q: Queue; DB: D1Database }>>{
     async queue(batch, env) {
         for (const msg of batch.messages) {
             const { jobId, userId, limit } = msg.body
             const listings = await fetchEtsyListings(limit)
             await env.GPT_Q.send({ jobId, userId, listings })
         }
     }
 }

