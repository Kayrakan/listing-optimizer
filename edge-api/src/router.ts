import { Hono } from "hono"
import { verifyJwt } from "./utils/jwt"
import { signBody } from "./utils/crypto"

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const app = new Hono()

    app.post("/scan", async c => {
      const claims = await verifyJwt(c.req, env)
      const { limit } = await c.req.json()
      const jobId = crypto.randomUUID()
      await env.DB.prepare(
          "INSERT INTO jobs(id,user_id,status,created_at) VALUES($1,$2,'queued',now())"
      ).bind(jobId, claims.sub).run()
      await env.SCAN_Q.send({ jobId, userId: claims.sub, limit })
      return c.json({ jobId })
    })

    app.get("/result", async c => { /* SELECT result_json ... */ })
    app.post("/patch", async c => { /* quota check → PATCH_Q.send */ })

    return app.fetch(req, env, ctx)
  }
}
