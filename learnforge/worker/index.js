export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    // 1. Simple CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Route: AI Proxy (NVIDIA NIM)
    if (url.pathname === "/api/ai" && request.method === "POST") {
      const body = await request.json();
      
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // 3. Route: Save Roadmap to D1
    if (url.pathname === "/api/save-roadmap" && request.method === "POST") {
      const { id, user_id, config, roadmap } = await request.json();
      await env.DB.prepare(
        "INSERT OR REPLACE INTO roadmaps (id, user_id, config, roadmap, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, user_id, JSON.stringify(config), JSON.stringify(roadmap), Date.now()).run();
      
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 4. Route: Load Roadmap from D1
    if (url.pathname === "/api/load-roadmap" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      const result = await env.DB.prepare(
        "SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
      ).bind(userId).first();
      
      return new Response(JSON.stringify(result), { headers: corsHeaders });
    }

    // 5. Route: Save Progress to D1
    if (url.pathname === "/api/save-progress" && request.method === "POST") {
      const { user_id, data } = await request.json();
      await env.DB.prepare(
        "INSERT OR REPLACE INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)"
      ).bind(user_id, JSON.stringify(data), Date.now()).run();
      
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 6. Route: Load Progress from D1
    if (url.pathname === "/api/load-progress" && request.method === "GET") {
      const userId = url.searchParams.get("user_id");
      const result = await env.DB.prepare(
        "SELECT * FROM progress WHERE user_id = ?"
      ).bind(userId).first();
      
      return new Response(JSON.stringify(result), { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
