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
            <a href={this.docUrl('installation.html', this.props.language)}>
              Getting Started
            </a>
            <a href={this.docUrl('tutorial.html', this.props.language)}>
              Tutorial
            </a>
            <a href={this.pageUrl('examples.html', this.props.language)}>
              Examples
            </a>
          </div>
          <div>
            <h5>&nbsp;</h5>
            <div className="footerIcons">
              <a href="https://github.com/qlik-oss/picasso.js">
                <img
                  src={this.props.config.baseUrl + 'img/GitHub-Mark-Light-120px-plus.png'}
                  alt="GitHub"
                  width="25"
                  height="25"
                />
              </a>
              <a href="http://qlikbranch-slack-invite.herokuapp.com/">
                <img
                  src={this.props.config.baseUrl + 'img/Slack_Mark_Monochrome_White.svg'}
                  alt="Join us on Slack"
                  width="50"
                  height="50"
                />
              </a>
              <a className="github-button" href="https://github.com/qlik-oss/picasso.js" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star qlik-oss/picasso.js on GitHub">Star</a>
            </div>
          </div>
        </section>

        <a
          href="https://github.com/qlik-oss/"
          target="_blank"
          className="qlikOpenSource">
          <img
            src={this.props.config.baseUrl + 'img/QlikLogo-White.png'}
            alt="Qlik Open Source"
            width="170"
            height="45"
          />
        </a>
        <section className="copyright">
          Copyright &copy; {currentYear} QlikTech International AB.
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
