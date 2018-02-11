const baseUrl = '/';

const siteConfig = {
  title: 'picasso.js',
  tagline: 'Make Pablo proud',
  url: 'http://picassojs.com',
  baseUrl,
  projectName: 'picasso.js',
  cname: 'picassojs.com',
  organizationName: 'qlik-oss',
  headerLinks: [
    { doc: 'installation', label: 'Docs' },
    { doc: 'tutorial', label: 'Tutorial' },
    { page: 'examples', label: 'Examples' },
    { href: 'https://github.com/qlik-oss/picasso.js', label: 'GitHub' }
  ],
  headerIcon: 'img/picassojs.svg',
  disableHeaderTitle: true,
  footerIcon: 'img/picassojs.svg',
  gaTrackingId: 'UA-113818093-1',
  favicon: 'img/favicon.png',
  colors: {
    primaryColor: '#333',
    secondaryColor: '#555'
  },
  copyright: `Copyright © ${new Date().getFullYear()} QlikTech International AB`,
  highlight: {
    theme: 'atom-one-light'
  },
  customDocsPath: './docs/dist',
  scripts: [
    'https://buttons.github.io/buttons.js',
    `${baseUrl}js/picasso.min.js`,
    `${baseUrl}js/landing.js`,
    `${baseUrl}js/tutorial.js`
  ],
  repoUrl: 'https://github.com/qlik-oss/picasso.js',
  twitter: true
};

module.exports = siteConfig;
