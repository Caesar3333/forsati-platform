// © 2026 Forsati. All rights reserved.
// Strapi Plugins Configuration

module.exports = ({ env }) => ({
  // Internationalization plugin
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'ar',
      locales: ['ar', 'en'],
    },
  },
  
  // Users & Permissions plugin
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});
