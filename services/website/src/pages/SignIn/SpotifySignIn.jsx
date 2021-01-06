import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SpotifyActions, UserActions } from '../../lib/state/actions';

class SpotifySignIn extends Component {
  state = {
    message: '',
  };

  componentDidMount() {
    /*
     * Check for redirect from Spotify.
     */
    let query = new URLSearchParams(this.props.location.search);
    let code = query.get('code');
    if (code) {
      this.props.getSpotifyTokens(code);
      this.setState({
        message: 'Getting Access and Refresh Token from Spotify',
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.refreshToken !== prevProps.refreshToken) {
      this.setState({ message: 'Got Refresh Token... Signing Into Playola' });
      this.props.signInToPlayola(this.props.refreshToken);
    } else if (this.props.user) {
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <div>
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    test: 'hi',
    ...state.spotify,
    ...state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getSpotifyTokens: (code) => dispatch(SpotifyActions.getSpotifyTokens(code)),
    signInToPlayola: (refreshToken) =>
      dispatch(UserActions.signInUser(refreshToken)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotifySignIn);
