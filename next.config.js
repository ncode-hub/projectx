module.exports = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      tls: false,
      net: false,
      fs: false,
      child_process: false,
    };
    return config;
  },
};

