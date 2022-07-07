import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  return json(
    {
      short_name: "DolAR",
      name: "DolAR",
      start_url: "/",
      display: "standalone",
      background_color: "#d3d7dd",
      theme_color: "#c34138",
      shortcuts: [
        {
          name: "Homepage",
          url: "/",
          icons: [
            {
              src: "/mstile-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "any monochrome",
            },
          ],
        },
      ],
      icons: [
        {
          src: "/mstile-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "/mstile-70x70.png",
          sizes: "70x70",
          type: "image/png",
        },
        {
          src: "/mstile-150x150.png",
          sizes: "150x150",
          type: "image/png",
        },
        {
          src: "/mstile-310x150.png",
          sizes: "310x150",
          type: "image/png",
        },
        {
          src: "/mstile-310x310.png",
          sizes: "310x310",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    }
  );
};
