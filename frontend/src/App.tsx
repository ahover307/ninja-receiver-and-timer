import "./App.css";
import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Display } from "./components/Display.tsx";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { anon_key, endpoint } from "./Constants/Env.ts";

export const App = () => {
  const [supabase, setSupabase] = useState<SupabaseClient>();

  useEffect(() => {
    setSupabase(createClient(endpoint, anon_key));
  }, []);

  if (!supabase) return <div>Connecting to backend... loading</div>;

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
          <div>Please go to <a href={"/display/paramount"}>/display/paramount</a>, this page is not yet built</div>
      ),
    },
    {
      path: "/:location",
      element: (
        <div>Please go to <a href={"/display/paramount"}>/display/paramount</a>, this page is not yet built</div>
      ),
    },
    {
      path: "/display/:location",
      element: <Display supabase={supabase} />,
    },
  ]);

  return <RouterProvider router={router} />;
};
