export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const origin = request.headers.get("Origin");
    // For local development, allow any origin, but for production check env
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN !== "*") {
      return new Response("Forbidden", { status: 403 });
    }

    // In-memory rate limiting (Note: not perfect for multi-isolate but good enough for this layer)
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    
    // Simplistic in-memory rate limit using global map (resets on isolate recycle)
    if (!globalThis.rateLimiter) {
      globalThis.rateLimiter = new Map();
    }
    const limiter = globalThis.rateLimiter;
    const now = Date.now();
    const windowStart = now - 60000;
    
    let requests = limiter.get(ip) || [];
    requests = requests.filter(time => time > windowStart);
    
    if (requests.length >= 10) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
    
    requests.push(now);
    limiter.set(ip, requests);

    // Forward request
    try {
      const body = await request.text();
      
      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: body
      });

      // Stream response back
      return new Response(anthropicResponse.body, {
        status: anthropicResponse.status,
        headers: {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
          "Content-Type": anthropicResponse.headers.get("Content-Type") || "application/json",
        }
      });
    } catch (err) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
