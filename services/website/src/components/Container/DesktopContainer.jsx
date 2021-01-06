import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Button, Visibility, Segment, Dimmer } from 'semantic-ui-react';
import { Media } from './Media';
import config from '../../lib/config';
import HomepageHeading from '../Welcome/HomepageHeading';
import { UserActions } from '../../lib/state/actions';

/*
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */
class DesktopContainer extends Component {
  state = {};

  hideFixedMenu = () => this.setState({ fixed: false });
  showFixedMenu = () => this.setState({ fixed: true });

  render() {
    const { children, user } = this.props;
    const { fixed } = this.state;

    const renderedNavBar = user ? (
      <Menu
        style={{ border: 'none' }}
        fixed={fixed ? 'top' : null}
        inverted={!fixed}
        pointing={!fixed}
        secondary={!fixed}
        size="large"
      >
        <Menu.Item as="a" active>
          Dashboard
        </Menu.Item>
        <Menu.Item as="a">Why?</Menu.Item>
        <Menu.Item as="a">Download</Menu.Item>
        <Menu.Item as="a">Features</Menu.Item>
        <Menu.Item position="right">
          <Button
            inverted={!fixed}
            primary={fixed}
            style={{ marginLeft: '0.5em' }}
            onClick={this.props.signOutUser}
          >
            Sign Out
          </Button>
        </Menu.Item>
      </Menu>
    ) : (
      <Menu
        style={{ border: 'none' }}
        fixed={fixed ? 'top' : null}
        inverted={!fixed}
        pointing={!fixed}
        secondary={!fixed}
        size="large"
      >
        <Menu.Item as="a" active>
          Home
        </Menu.Item>
        <Menu.Item as="a">Why?</Menu.Item>
        <Menu.Item as="a">Download</Menu.Item>
        <Menu.Item as="a">Features</Menu.Item>
        <Menu.Item position="right">
          <Button
            as="a"
            inverted={!fixed}
            primary={fixed}
            style={{ marginLeft: '0.5em' }}
            href={config.spotifyCallbackURI}
          >
            Sign In With Spotify
          </Button>
        </Menu.Item>
      </Menu>
    );

    return (
      <Media greaterThan="mobile">
        <Visibility
          once={false}
          onBottomPassed={this.showFixedMenu}
          onBottomPassedReverse={this.hideFixedMenu}
        >
          <Segment
            inverted
            textAlign="center"
            style={{
              minHeight: 700,
              padding: '1em 0em',
              backgroundImage: 'url(https://static.playola.fm/bg-1@2x.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
            }}
            vertical
          >
            <Dimmer active style={{ background: 'rgba(0, 0, 0, 0.55)' }}>
              {renderedNavBar}

              {this.props.headingSection}

              <HomepageHeading />
            </Dimmer>
          </Segment>
        </Visibility>
        {children}
      </Media>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signOutUser: () => dispatch(UserActions.signOutUser()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(DesktopContainer);
