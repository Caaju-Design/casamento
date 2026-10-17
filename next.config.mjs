/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Cartas da festa (jogo de missões pros convidados): página estática,
      // autocontida, em public/cartas/index.html → casamento.caaju.com.br/cartas
      { source: "/cartas", destination: "/cartas/index.html" },
      // Convite das damas (cortejo da noiva): página estática, autocontida,
      // em public/convited/index.html → casamento.caaju.com.br/convited
      { source: "/convited", destination: "/convited/index.html" },
    ];
  },
  async redirects() {
    return [
      // Endereço antigo do convite das damas: mantém os links já enviados.
      { source: "/damas", destination: "/convited", permanent: false },
      { source: "/damas/index.html", destination: "/convited", permanent: false },
    ];
  },
};

export default nextConfig;
