/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Cartas da festa (jogo de missões pros convidados): página estática,
      // autocontida, em public/cartas/index.html → casamento.caaju.com.br/cartas
      { source: "/cartas", destination: "/cartas/index.html" },
      // Convite das damas (cortejo da noiva): página estática, autocontida,
      // em public/damas/index.html → casamento.caaju.com.br/damas
      { source: "/damas", destination: "/damas/index.html" },
    ];
  },
};

export default nextConfig;
