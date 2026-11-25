/*
  Lew2Visuals — site content.
  Everything a non-developer will want to change lives in this file:
  booking status, contact details, services, and the project list.
  Items marked PLACEHOLDER are waiting on real info from Lewis.
*/
window.L2V = {
  site: {
    name: "Lew2Visuals",
    owner: "Lewis",
    booking: "Booking Dec 2026",            // shown in header, CTAs and contact page
    email: "hello@lew2visuals.com",          // PLACEHOLDER
    instagram: "@lew2visuals",               // PLACEHOLDER
    instagramUrl: "https://instagram.com/",  // PLACEHOLDER
    based: "Edmonton, AB",
    shootsIn: "Edmonton / Calgary / Toronto / Anywhere",
    replies: "Within 1 to 2 days",
    timeZone: "America/Edmonton",
    formEndpoint: "",                        // e.g. a Formspree URL; empty = mailto fallback
    heroReel: "media/hero-reel.mp4",         // swap for Lewis's highlight reel
    heroPoster: "media/posters/hero-reel.jpg",
    heroCuts: [0, 10]                        // seconds where the reel cuts; drives the frame-shape changes
  },

  services: [
    {
      id: "event",
      seq: "SEQ 01",
      title: "Event Coverage",
      for: "Conferences, galas, launches, game nights",
      items: ["Recap film (60 to 120s)", "Vertical social cuts", "Same-week photo selects", "Speaker or highlight clips"],
      clip: "after-dark-gala"
    },
    {
      id: "brand",
      seq: "SEQ 02",
      title: "Brand Content",
      for: "Shops, cafes, product launches",
      items: ["Hero brand film", "Product and space visuals", "Monthly social content packs", "Photo library"],
      clip: "slow-pour"
    },
    {
      id: "streetwear",
      seq: "SEQ 03",
      title: "Streetwear Campaigns",
      for: "Clothing brands, drops, lookbooks",
      items: ["Campaign film", "Lookbook stills", "Teasers and countdown cuts", "Creative direction"],
      clip: "after-hours"
    },
    {
      id: "music",
      seq: "SEQ 04",
      title: "Music Visuals",
      for: "Artists, labels, live sets",
      items: ["Music video", "Performance and visualizer cuts", "Cover art stills", "Release teasers"],
      clip: "smoke-and-strobe"
    }
  ],

  process: [
    { id: "01_CALL", when: "Day 1", title: "Call", body: "Quick call about what you need, where it lives, and when it has to drop.", span: 1 },
    { id: "02_PLAN", when: "Week 1", title: "Plan", body: "Shot list, schedule and a clear quote. No surprises on shoot day.", span: 2 },
    { id: "03_SHOOT", when: "Shoot day", title: "Shoot", body: "Small crew, fast setup. You get to focus on your event or your product.", span: 1.6 },
    { id: "04_DELIVER", when: "48 hrs to 2 wks", title: "Deliver", body: "Edit, colour, sound and every cut-down you need, in every format.", span: 3 }
  ],

  /* PLACEHOLDER projects — titles and clients are stand-ins until Lewis sends real work. */
  projects: [
    { slug: "after-hours", title: "After Hours", client: "Streetwear label (placeholder)", type: "Streetwear", year: "2026", duration: "00:00:10",
      brief: "A night-time campaign film shot in a downtown parkade. Sodium light, haze and one continuous move toward camera.",
      role: "Direction, camera, edit, colour", deliverables: "Campaign film, 3 vertical teasers, lookbook stills" },
    { slug: "after-dark-gala", title: "After Dark Gala", client: "Charity gala (placeholder)", type: "Event", year: "2026", duration: "00:00:08",
      brief: "Recap of a 400-guest evening gala. Delivered a 90-second recap within 48 hours, plus speaker clips the next week.",
      role: "Camera, edit", deliverables: "Recap film, 6 social cuts, 120 photo selects" },
    { slug: "slow-pour", title: "Slow Pour", client: "Specialty cafe (placeholder)", type: "Brand", year: "2026", duration: "00:00:08",
      brief: "Brand content for a neighbourhood cafe: macro detail, warm window light and a monthly social content pack.",
      role: "Camera, edit, colour", deliverables: "Brand film, monthly content pack" },
    { slug: "smoke-and-strobe", title: "Smoke & Strobe", client: "Independent artist (placeholder)", type: "Music", year: "2026", duration: "00:00:08",
      brief: "Performance video in a warehouse full of haze, lit with nothing but a strobe and a single backlight.",
      role: "Direction, camera, edit", deliverables: "Music video, visualizer, 4 teasers" },
    { slug: "floodlights", title: "Floodlights", client: "Community league (placeholder)", type: "Event", year: "2025", duration: "00:00:08",
      brief: "Night-game highlight film for a local league, where Lew2Visuals started: a camera at local games.",
      role: "Camera, edit", deliverables: "Highlight film, player clips" },
    { slug: "night-drive", title: "Night Drive", client: "Independent artist (placeholder)", type: "Music", year: "2025", duration: "00:00:08",
      brief: "Moody interior car sequence for a late-night single. City lights sliding across a wet windshield.",
      role: "Camera, edit, colour", deliverables: "Music video, lyric cuts" },
    { slug: "golden-overpass", title: "Golden Overpass", client: "Clothing brand (placeholder)", type: "Streetwear", year: "2025", duration: "00:00:08",
      brief: "Golden-hour lookbook under a highway overpass for a capsule drop.",
      role: "Creative direction, camera", deliverables: "Lookbook film, 40 stills" },
    { slug: "dusk-run", title: "Dusk Run", client: "Skate shop (placeholder)", type: "Brand", year: "2025", duration: "00:00:08",
      brief: "Low tracking skate film through empty streets at dusk for a shop's new-season launch.",
      role: "Camera, edit", deliverables: "Brand film, 5 vertical cuts" },
    { slug: "city-at-night", title: "City at Night", client: "Tourism campaign (placeholder)", type: "Brand", year: "2025", duration: "00:00:10",
      brief: "Aerial night sequence over downtown for a city campaign opener.",
      role: "Aerial, edit, colour", deliverables: "Campaign opener, stock library" },
    { slug: "river-valley-dawn", title: "River Valley Dawn", client: "Real estate developer (placeholder)", type: "Brand", year: "2024", duration: "00:00:08",
      brief: "Sunrise establishing shots of the skyline and river valley for a development launch film.",
      role: "Aerial, camera", deliverables: "Launch film, establishing library" }
  ],

  /* PLACEHOLDER quotes — shown in this order as you scroll. `clip` is the project image beside each quote. */
  testimonials: [
    { quote: "Small crew, zero stress, and a cut that actually sounds like our brand.", who: "Owner", org: "Placeholder cafe", clip: "slow-pour" },
    { quote: "The recap was in our inbox before the venue was even packed up. Our sponsors shared it the same night.", who: "Events lead", org: "Placeholder client", clip: "after-dark-gala" },
    { quote: "He shot our drop like it was a feature film. The teasers did more than our last three campaigns combined.", who: "Founder", org: "Placeholder streetwear label", clip: "after-hours" }
  ]
};

/* Helpers */
window.L2V.clipSrc = (slug) => `media/clips/${slug}.mp4`;
window.L2V.posterSrc = (slug, n = 1) => `media/posters/${slug}${n > 1 ? "-" + n : ""}.jpg`;
window.L2V.project = (slug) => window.L2V.projects.find((p) => p.slug === slug);
