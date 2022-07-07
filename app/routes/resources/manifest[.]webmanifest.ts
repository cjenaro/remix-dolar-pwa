import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import msTile144 from "~/icons/mstile-144x144.png";
import msTile70 from "~/icons/mstile-70x70.png";
import msTile150 from "~/icons/mstile-150x150.png";
import msTile310x150 from "~/icons/mstile-310x150.png";
import msTile310 from "~/icons/mstile-310x310.png";

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
              src: msTile144,
              sizes: "144x144",
              type: "image/png",
              purpose: "any monochrome",
            },
          ],
        },
      ],
      icons: [
        {
          src: msTile144,
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: msTile70,
          sizes: "70x70",
          type: "image/png",
        },
        {
          src: msTile150,
          sizes: "150x150",
          type: "image/png",
        },
        {
          src: msTile310x150,
          sizes: "310x150",
          type: "image/png",
        },
        {
          src: msTile310,
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
