// Tiny zod helper for edge functions.
// Use:
//   import { z } from "https://esm.sh/zod@3.23.8";
//   import { parseBody } from "../_shared/validate.ts";
//   const parsed = await parseBody(req, z.object({ prompt: z.string().max(4000) }));
//   if (!parsed.ok) return parsed.response;
//   const { prompt } = parsed.data;

import type { ZodSchema } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders } from "./cors.ts";

type ParseResult<T> =
  | { ok: true; data: T; response: null }
  | { ok: false; data: null; response: Response };

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<ParseResult<T>> {
  const cors = buildCorsHeaders(req);
  let body: unknown;
  try { body = await req.json(); } catch {
    return {
      ok: false, data: null,
      response: new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      }),
    };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false, data: null,
      response: new Response(
        JSON.stringify({ error: "invalid_input", details: result.error.flatten() }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      ),
    };
  }
  return { ok: true, data: result.data, response: null };
}
