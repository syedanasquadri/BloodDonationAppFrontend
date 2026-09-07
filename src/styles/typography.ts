import { colors } from "./colors";

export const typography = {
  title: {
    fontSize: 34,
    fontWeight: "800" as const,
    color: colors.text,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: colors.text,
  },

  body: {
    fontSize: 16,
    color: colors.text,
  },

  caption: {
    fontSize: 14,
    color: colors.muted,
  },
};