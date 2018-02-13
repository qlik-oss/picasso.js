const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
// const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

class Button extends React.Component {
  render() {
    let className = "button";
    if (this.props.scream) {
      className += ' scream';
    }
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className={className} href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
      <div className="wrapper">
        <div className="graphic">
          <div className="barchart">
            <div style={{height: '100%'}}></div>
            <div style={{height: '80%'}}></div>
            <div style={{height: '40%'}}></div>
            <div style={{height: '60%'}}></div>
            <div style={{height: '70%'}}></div>
            <div style={{height: '40%'}}></div>
            <div style={{height: '30%'}}></div>
            <div style={{height: '50%'}}></div>
            <div style={{height: '30%'}}></div>
          </div>
          <div className="scatter">
            <div style={{left: '50%', top: '30%', width: 100, height: 100}}></div>
            <div style={{left: '80%', top: '60%', width: 50, height: 50}}></div>
            <div style={{left: '60%', top: '80%', width: 30, height: 30}}></div>
            <div style={{left: '30%', top: '70%', width: 80, height: 80}}></div>
            <div style={{left: '10%', top: '40%', width: 70, height: 70}}></div>
            <div className="mask" style={{left: '90%', bottom: '-70px', width: 140, height: 140}}></div>
            <div className="mask" style={{left: '75%', bottom: '20px', width: 60, height: 60}}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Logo = props => (
  <div className="logo">
    <img src={props.img_src} />
  </div>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || '';
    return (
      <SplashContainer>
        <Logo img_src={imgUrl('picassojs.svg')} />
        <h2 className="projectTitle">
          <small>Turn your data into a visual masterpiece</small>
        </h2>
        <PromoSection>
          <Button href={docUrl('installation.html')}>Get started</Button>
          <Button href={pageUrl('examples.html')} scream="true">Examples</Button>
        </PromoSection>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock contents={props.children} layout={props.layout} />
  </Container>
); 

// const Components_ = props => (
//   <Block>
//     {[
//       {
//         content: "Components are the visual building blocks that make up the chart, by combining them in various forms virtually any chart can be created. A bar chart, for example, consists of a bar layer, a continuous and a discrete axis. Add a line layer and you have a combo chart. Want a line chart with four axes? - Not a problem.",
//         //image: imgUrl('components-bars.svg'),
//         imageAlign: 'right',
//         title: 'Components',
//       },
//     ]}
//   </Block>
// );

const Components = props => (
  <Container padding={['bottom', 'top']}>
    <div className="gridBlock">
      <div className="blockElement imageAlignSide twoByGridBlock">
        <div className="blockContent">
          <h2><div><span><p>Components</p></span></div></h2>
          <div><span><p>Components are the visual building blocks that make up the chart, by combining them in various forms virtually any chart can be created. A bar chart, for example, consists of a bar layer, a continuous and a discrete axis. Add a line layer and you have a combo chart. Want a line chart with four axes? - Not a problem.</p></span></div>
        </div>
        <div className="blockImage blockComposition">
          <div className="blockComposition-inner">
            <div className="components state-0" id="threed-chart">
              <div className="layer c-grid"><img src={imgUrl("components-grid.svg")}/></div>
              <div className="layer c-bars"><img src={imgUrl("components-bars.svg")}/></div>
              <div className="layer c-labels"><img src={imgUrl("components-labels.svg")}/></div>
              <div className="layer c-reference"><img src={imgUrl("components-reference.svg")}/></div>
              <div className="layer c-legend"><img src={imgUrl("components-legend.svg")}/></div>
              <div className="layer c-discrete"><img src={imgUrl("components-discrete.svg")}/></div>
              <div className="layer c-continuous"><img src={imgUrl("components-continuous.svg")}/></div>
              <div className="layer c-v-title"><img src={imgUrl("components-v-title.svg")}/></div>
              <div className="layer c-h-title"><img src={imgUrl("components-h-title.svg")}/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
);

const Extensible = props => (
  <Block>
    {[
      {
        content: 'picasso.js provides a plugin system that makes it easy to extend existing functionality - you can register and use custom components that play well with the existing ones, create a new theme, provide your own data parser or even register a custom renderer that outputs sketchy graphics. picasso.js uses D3.js for a lot of its functionality and strives to provide the D3 community with a way to repurpose and easily integrate their work into picasso.js.',
        image: imgUrl('plugin.svg'),
        imageAlign: 'left',
        title: 'Extensible',
      },
    ]}
  </Block>
);


const Interactive = props => (
  <Block>
    {[
      {
        content: "Apart from basic interaction patterns, interactivity in the form of brushing and linking is provided out of the box - drag a range on a linear axis to highlight all values that fall within that range, our use the lasso tool to highlight a cluster of points. The brushed values can then programmatically be linked and highlighted in another chart instance.",
        image: imgUrl('pie-chart-lasso.gif'),
        imageAlign: 'right',
        title: 'Interactive',
      },
    ]}
  </Block>
);

const Responsive = props => (
  <Block>
    {[
      {
        content: "By using relative units and a unique layout algorithm we can ensure the composed charts are responsive. The same configuration can be used for a full sized chart containing details, annotations etc., as for a sparkline version - components are automatically resized or removed if they don't fit.",
        image: imgUrl('responsive.svg'),
        imageAlign: 'left',
        title: 'Responsive',
      },
    ]}
  </Block>
);

const Themeable = props => (
  <Block>
    {[
      {
        content: "The visual look of labels, lines, shapes, color palettes etc. can all be modified and a new theme created by just changing a few base variables that control the look and feel throughout, including plugins.",
        image: imgUrl('themes.svg'),
        imageAlign: 'right',
        title: 'Themeable',
      },
    ]}
  </Block>
);

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Components />
          <Extensible />
          <Interactive />
          <Responsive />
          <Themeable />
        </div>
      </div>
    );
  }
}

module.exports = Index;
