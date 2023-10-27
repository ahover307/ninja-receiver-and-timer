import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const currentTime = new Date().toISOString();

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "REST method not supported" }), {
      headers: { "Content-Type": "application/json" },
      status: 405,
    });
  }

  const { action, location } = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const data = {
    message: `no action`,
    currentTime: currentTime,
  };

  if (action === "start") {
    console.log(`Attempting to start timer at ${location} at ${currentTime}`);
    //   Start timer
    const { data: timer, error } = await supabaseClient
      .from("timers")
      .select("*")
      .eq("location", location);
    if (error) {
      throw error;
    }
    console.log(timer);
    console.log(timer[0]);
    console.log(error);

    // If the timer is already running, stop it
    if (timer[0].isRunning) {
      timer[0].isRunning = false;
      timer[0].startTime = null;
      timer[0].endTime = null;
    } else {
      timer[0].isRunning = true;
      timer[0].startTime = currentTime;
      timer[0].endTime = null;
    }

    const { error2 } = await supabaseClient
      .from("timers")
      .update(timer)
      .eq("location", location);
    if (error2) {
      throw error2;
    }

    console.log(`Timer successfully started at ${location} at ${currentTime}`);
    data.message = "started";
  } else if (action === "stop") {
    console.log(`Attempting to stop timer at ${location} at ${currentTime}`);
    //   Stop timer
    const { data: timer, error } = await supabaseClient
      .from("timers")
      .select("*")
      .eq("location", location);
    if (error) {
      throw error;
    }

    // If the timer is already stopped, do nothing
    if (timer[0].isRunning) {
      timer[0].isRunning = false;
      timer[0].endTime = currentTime;
    }

    const { error2 } = await supabaseClient
      .from("timers")
      .update(timer)
      .eq("location", location);
    if (error2) {
      throw error2;
    }

    console.log(`Timer successfully stopped at ${location} at ${currentTime}`);
    data.message = "stopped";
  } else if (action === "keepAlive") {
    // const { data: timer } = await supabaseClient
    //   .from("timers")
    //   .select("*")
    //   .eq("location", location);

    return new Response(JSON.stringify({ message: "Kept alive" }), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    console.log(`Action ${action} not supported`);
    return new Response(JSON.stringify({ message: "action not supported" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
