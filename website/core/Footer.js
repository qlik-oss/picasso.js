const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + 'docs/' + doc;
    // return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + doc;
    // return baseUrl + (language ? language + '/' : '') + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('installation.html', this.props.language)}>Getting Started</a>
            <a href={this.docUrl('tutorial.html', this.props.language)}>Tutorial</a>
            <a href={this.pageUrl('examples.html', this.props.language)}>Examples</a>
          </div>
          <div>
            <h5>Links</h5>
            <a href="http://qlikbranch-slack-invite.herokuapp.com/">
              <i className="fa fa-slack"></i> Slack
            </a>
            <a href="https://twitter.com/picassodotjs">
              <i className="fa fa-twitter"></i> Twitter
            </a>
            <a href="https://github.com/qlik-oss/picasso.js">
              <i className="fa fa-github"></i> GitHub
            </a>
          </div>
        </section>

        <a href="https://github.com/qlik-oss/" target="_blank" className="qlikOpenSource">
          <img
            src={this.props.config.baseUrl + 'img/QlikLogo-White.png'}
            alt="Qlik Open Source"
            width="170"
            height="85"
          />
        </a>
        <section className="copyright">Copyright &copy; {currentYear} QlikTech International AB.</section>
      </footer>
    );
  }
}

module.exports = Footer;
