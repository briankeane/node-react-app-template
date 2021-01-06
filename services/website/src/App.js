import React from 'react';
// import './styles.css';
import 'semantic-ui-css/semantic.min.css';
import Default from './pages/index';
import SpotifySignIn from './pages/SignIn/SpotifySignIn';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Sample from './components/Sample';
// import Something from './components/Something';
// import NoMatch from './components/NoMatch';

export default function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact component={Default} />
          <Route path="/callbacks/spotify" exact component={SpotifySignIn} />
        </Switch>
      </Router>
    </div>
  );
}
