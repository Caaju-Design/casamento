import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "docs/**",
      "tests/**",
      ".next/**",
      "node_modules/**",
      "vitest.config.ts",
      "vitest.setup.ts",
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Regras novas do eslint-plugin-react-hooks v7 (voltadas para
      // compatibilidade com o React Compiler). Desligadas conscientemente
      // neste projeto porque conflitam com padrões legítimos usados aqui:
      // sincronizar estado com API do navegador (navigator.onLine, suporte
      // a WebGL) dentro de um efeito, e gerar posições aleatórias uma única
      // vez em useMemo/useState para a cena decorativa do three.js.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];

export default eslintConfig;
