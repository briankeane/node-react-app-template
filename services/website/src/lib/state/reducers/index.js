import { combineReducers } from 'redux';

import SpotifyReducer from './SpotifyReducer';
import UserReducer from './UserReducer';

export default combineReducers({
  spotify: SpotifyReducer,
  user: UserReducer,
});
