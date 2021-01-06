import {
  SIGN_IN_USER_REQUESTED,
  SIGN_IN_USER_SUCCESS,
  SIGN_IN_USER_ERROR,
  SIGN_OUT_USER,
} from '../constants';

import { UserActions } from '../actions';

const initialState = {
  jwtRequested: false,
  user: UserActions.getJWTUser(),
  jwt: UserActions.getJWT(),
  error: null,
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN_USER_REQUESTED:
      return { ...state, jwtRequested: true };
    case SIGN_IN_USER_SUCCESS:
      return { ...state, user: action.user, jwt: action.jwt };
    case SIGN_IN_USER_ERROR:
      return { ...state, error: action.err };
    case SIGN_OUT_USER:
      return { ...state, error: null, user: null, jwt: null };
    default:
      return state;
  }
};

export default UserReducer;
