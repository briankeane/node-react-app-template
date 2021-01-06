'use strict';

import React from 'react';
// import Head from 'next/head';
// import Router from 'next/router';
// import NProgress from 'nprogress';
import StyleGuide from '../StyleGuide';
// import { NotificationCenter } from '..//Notifications';

// import analytics from '../../lib/analytics';

export default class extends React.Component {
  // componentDidMount = () => {
  //   if (!window.GA_INITIALIZED) {
  //     //   analytics.initGA();
  //     window.GA_INITIALIZED = true;
  //   }
  //   this.handleNewPage();
  //   Router.onRouteChangeComplete = this.handleRouteChangeComplete;
  // };

  // componentWillUnmount = () => {
  //   Router.onRouteChangeComplete = null;
  // };

  // handleNewPage = () => {
  //   // analytics.logPageView();
  //   NProgress.done();
  // };

  // handleRouteChangeComplete = () => {
  //   this.handleNewPage();
  //   window.scrollTo(0, 0);
  // };

  render() {
    const { children } = this.props;
    return (
      <div className="fl-app">
        {/* <Head>
          <title>Playola</title>
        </Head> */}
        <StyleGuide>
          {/* <NotificationCenter /> */}
          {children}
        </StyleGuide>
      </div>
    );
  }
}
