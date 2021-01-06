import {
  GET_SPOTIFY_TOKENS_REQUEST,
  GET_SPOTIFY_TOKENS_SUCCESS,
  GET_SPOTIFY_TOKENS_ERROR,
} from '../constants';

const initialState = {
  tokenRequested: false,
  tokenSuccess: false,
  accessToken: null,
  refreshToken: null,
  error: null,
};

const SpotifyReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOTIFY_TOKENS_REQUEST:
      return { ...state, tokenRequested: true };
    case GET_SPOTIFY_TOKENS_SUCCESS:
      return {
        ...state,
        tokenRequested: false,
        isLoggedIn: true,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
      };
    case GET_SPOTIFY_TOKENS_ERROR:
      return { ...state, error: action.err };
    default:
      return state;
  }
};

export default SpotifyReducer;
