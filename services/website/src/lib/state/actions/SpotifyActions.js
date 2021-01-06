import api from '../../api';
import {
  GET_SPOTIFY_TOKENS_SUCCESS,
  GET_SPOTIFY_TOKENS_ERROR,
  GET_SPOTIFY_TOKENS_REQUEST,
} from '../constants';

export const getSpotifyTokens = (code) => {
  return function (dispatch) {
    dispatch({ type: GET_SPOTIFY_TOKENS_REQUEST });

    const finish = function (err, tokens) {
      if (err) {
        dispatch({ type: GET_SPOTIFY_TOKENS_ERROR, err });
      } else {
        dispatch({
          type: GET_SPOTIFY_TOKENS_SUCCESS,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      }
    };

    api
      .getSpotifyTokens(code)
      .then((tokens) => finish(null, tokens))
      .catch((err) => finish(err));
  };
};

export default {
  getSpotifyTokens,
};
