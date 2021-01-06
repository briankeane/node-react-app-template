import React from 'react';
// import Head from "next/head";
// import Progress from "../Progress";

// import styles from './StyleGuide.module.css';

// const GOTHAM_FONT_URL =
//   process.env.TYPOGRAPHY_GOTHAM_FONT_URL ||
//   'https://cloud.typography.com/7901396/7040572/css/fonts.css';

class StyleGuide extends React.Component {
  loadFonts = () => {
    const WebFont = require('webfontloader');
    WebFont.load({
      google: {
        families: ['Work Sans'],
      },
    });
  };

  componentDidMount() {
    this.loadFonts();
  }

  render() {
    const { children } = this.props;
    return (
      <div className="playola-style-guide">
        {/* <Head>
          <link rel="stylesheet" type="text/css" href={GOTHAM_FONT_URL} />
          <meta
            name="viewport"
            content={
              "user-scalable=0, initial-scale=1, maximum-scale=1, " +
              "minimum-scale=1, width=device-width, height=device-height"
            }
          /> */}
        {/* </Head>
        <Progress /> */}
        {children}
      </div>
    );
  }
}

export default StyleGuide;
