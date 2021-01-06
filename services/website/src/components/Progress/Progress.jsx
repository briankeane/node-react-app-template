'use strict';

import React from 'react';
import NProgress from 'nprogress';
import Router from 'next/router';

/**
 * Configure NProgress
 */
NProgress.configure({ showSpinner: false });
Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

export default () => <div></div>;
