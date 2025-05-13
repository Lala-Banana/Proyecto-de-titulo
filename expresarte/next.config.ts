const nextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**' 
      },
      { 
        protocol: 'https', 
        hostname: 'example.com',
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'img.freepik.com',
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'picsum.photos',
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'images.unsplash.com',
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'plus.unsplash.com',
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'link-de-imagen.com',  // Aquí agregamos el nuevo dominio
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'i.pinimg.com',  // Aquí agregamos el nuevo dominio
        pathname: '/**'
      },
      { 
        protocol: 'https', 
        hostname: 'static.wikia.nocookie.net',  // Aquí agregamos el nuevo dominio
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.reddit.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.rafled.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cl.pinterest.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
