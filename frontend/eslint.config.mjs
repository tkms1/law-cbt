import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // types/validator.ts も対象に含める
    files: ["**/*.d.ts", "types/validator.ts"],
    rules: {
      // 空オブジェクトのエラーを無視
      "@typescript-eslint/no-empty-object-type": "off",
      // 👇 今回追加：any型の使用エラーを無視
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
