const baseUrl = '/';

const siteConfig = {
  title: 'picasso.js',
  tagline: 'Turn your data into a visual masterpiece',
  disableTitleTagline: true,
  url: 'https://picassojs.com',
  baseUrl,
  projectName: 'picasso.js',
  cname: 'picassojs.com',
  organizationName: 'qlik-oss',
  headerLinks: [
    { doc: 'installation', label: 'Docs' },
    { doc: 'tutorial', label: 'Tutorial' },
    { page: 'examples', label: 'Examples' },
    { search: true },
    { href: 'https://github.com/qlik-oss/picasso.js', label: '\uf09b' },
    { href: 'https://twitter.com/picassodotjs', label: '\uf099' }
  ],
  headerIcon: 'img/picassojs.svg',
  disableHeaderTitle: true,
  scrollToTop: true,
  footerIcon: 'img/picassojs.svg',
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
    `${baseUrl}js/landing.js`
  ],
  stylesheets: [
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
  ],
  repoUrl: 'https://github.com/qlik-oss/picasso.js',
  editUrl: 'https://github.com/qlik-oss/picasso.js/edit/master/docs/src/input/',
  gaTrackingId: 'UA-113818093-1',
  ogImage: 'img/picassojs.png',
  twitter: true,
  twitterImage: 'img/picassojs.png',
  algolia: {
    apiKey: '3acaf839e39f2abc9d53e17093978fe3',
    indexName: 'picassojs',
    algoliaOptions: {
      hitsPerPage: 7
    }
  }
};

module.exports = siteConfig;
