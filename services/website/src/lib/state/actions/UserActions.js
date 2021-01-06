import api from '../../api';
import {
  SIGN_IN_USER_REQUEST,
  SIGN_IN_USER_SUCCESS,
  SIGN_IN_USER_ERROR,
} from '../constants';
import cookies from 'js-cookie';
import storage from '../../storage';
import { parseJWT } from '../../utils';

export const signInUser = (refreshToken) => {
  return function (dispatch) {
    dispatch({ type: SIGN_IN_USER_REQUEST });

    const finish = function (err, jwt) {
      if (err) {
        dispatch({ type: SIGN_IN_USER_ERROR, err });
      } else {
        storeToken(jwt);
        let user = parseJWT(jwt);
        dispatch({
          type: SIGN_IN_USER_SUCCESS,
          jwt,
          user,
        });
      }
    };

    api
      .signIn(refreshToken)
      .then((token) => finish(null, token))
      .catch((err) => finish(err));
  };
};

export const signOutUser = () => {
  return function (dispatch) {
    removeToken();
    dispatch({ type: 'SIGN_OUT_USER' });
  };
};

/**
 * Helpers
 */

function storeToken(token) {
  if (typeof window !== undefined) {
    const domain = window.location.hostname;
    cookies.set(storage.cookies.JWT_TOKEN, token, {
      domain,
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

function removeToken() {
  if (typeof window !== undefined) {
    cookies.remove(storage.cookies.JWT_TOKEN, {
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

const getJWT = (ctx = null) => {
  const key = storage.cookies.JWT_TOKEN;
  return window !== undefined ? cookies.get(key) : null;
};

const getJWTUser = (ctx = null) => {
  const token = getJWT(ctx);
  if (!token) {
    return null;
  }
  return parseJWT(token);
};

export default {
  signInUser,
  signOutUser,
  getJWTUser,
  getJWT,
};
