import React from 'react';
import { Segment, Grid, Header, Image, Transition } from 'semantic-ui-react';

const HomepageHeading = ({ mobile }) => (
  <Segment style={{ padding: '0em 0em' }} vertical>
    <Grid container stackable verticalAlign="middle">
      <Grid.Row>
        <Grid.Column width={8} style={{ color: 'white' }}>
          <Header
            as="h2"
            style={{
              '&::before': { background: 'black' },
              fontSize: '2.8em',
              color: 'white',
            }}
          >
            Broadcast Your Very Own 24/7 Radio Station
          </Header>
          <p style={{ fontSize: '1.33em', color: '#b3b3b3' }}>
            Ever wonder what it would be like to own your own radio station? Now
            you can, and it fits right in your pocket.
          </p>
        </Grid.Column>
        <Grid.Column floated="right" width={6}>
          <Transition
            animation="fly left"
            duration={1000}
            transitionOnMount={true}
          >
            <Image
              bordered
              centered
              rounded
              size="medium"
              src="https://static.playola.fm/phone-1@2x.png"
            />
          </Transition>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
);

export default HomepageHeading;
