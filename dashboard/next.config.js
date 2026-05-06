/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.discordapp.com", "cdn.discord.com"],
  },
  // Expose NEXTAUTH_URL to the server runtime (it's already available as a
  // process.env variable, but listing it here makes it explicit).
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

module.exports = nextConfig;
