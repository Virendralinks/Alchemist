/** @type {import('next').NextConfig} */
const nextConfig = {
  // The CJS dictionary cannot be webpack'd into an RSC graph. Even after the
  // catalogue stopped importing the engine, any accidental import (worker
  // fallback, tests mis-bundled) should require() from node_modules instead.
  experimental: {
    serverComponentsExternalPackages: ['cmu-pronouncing-dictionary'],
  },
};

export default nextConfig;
