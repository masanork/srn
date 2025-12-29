/**
 * Web/A Pre-key Vending Machine
 * Cloudflare Worker + D1
 */

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint: GET /api/v1/prekey
    if (request.method === "GET" && url.pathname === "/api/v1/prekey") {
      try {
        // Atomic transaction to pick and consume a key
        const result = await env.DB.prepare(`
          UPDATE prekeys 
          SET status = 'consumed', consumed_at = CURRENT_TIMESTAMP 
          WHERE id = (
            SELECT id FROM prekeys 
            WHERE status = 'available' 
            ORDER BY id ASC 
            LIMIT 1
          )
          RETURNING kid, pub_key, pqc_pub_key
        `).first<{ kid: string; pub_key: string; pqc_pub_key: string | null }>();

        if (!result) {
          return new Response(JSON.stringify({ error: "No pre-keys available" }), {
            status: 503,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }

        return new Response(JSON.stringify({
          kid: result.kid,
          recipient_x25519: result.pub_key,
          recipient_pqc: result.pqc_pub_key
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    return new Response("Web/A Pre-key Server", { status: 200 });
  },
};
