import antfu from "@antfu/eslint-config";
import FlatCompat from "@eslint/eslintrc";
const compat = new FlatCompat();

export default antfu(
  {
    vue: true,
    rules: {
      "no-console": "warn",
    },
  },
  ...compat.config({
    extends: ["./typings/auto-components.d.ts"],
  })
);
