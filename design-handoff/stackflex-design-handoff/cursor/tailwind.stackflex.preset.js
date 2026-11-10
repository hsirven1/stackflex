// Tailwind v3 only. In tailwind.config.js: presets: [require("./tailwind.stackflex.preset.js")]
module.exports = {
  theme: {
    extend: {
      colors: {
        sf: {
          ink: "#0B0B0C", blue: "#3A2EFF", lime: "#D7FF3A", paper: "#FAF9F6", chip: "#F4F3EF", line: "#ECEAE4",
          body: "#55534D", muted: "#6F6D66", subtle: "#8C897F", faint: "#A8A59C", ver: "#2A2925",
        },
      },
      fontFamily: {
        display: ["var(--font-funnel-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-funnel-sans)", "system-ui", "sans-serif"],
      },
    },
  },
};
