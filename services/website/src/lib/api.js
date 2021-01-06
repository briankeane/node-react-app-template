const axios = require('axios');
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

function signIn(spotifyRefreshToken) {
  return new Promise((resolve, reject) => {
    api
      .post('/v1/users', { spotifyRefreshToken })
      .then((res) => resolve(res.data.token))
      .catch((error) => reject(error));
  });
}

function getMe() {
  return new Promise((resolve, reject) => {
    api
      .get('/v1/users/me')
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

function getSpotifyTokens(code) {
  return new Promise((resolve, reject) => {
    const body = `code=${code}&redirect_uri=http://localhost:10060/callbacks/spotify`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    api
      .post('/v1/spotify/auth/token/swap', body, { headers })
      .then((res) =>
        resolve({
          refreshToken: res.data.refresh_token,
          accessToken: res.data.access_token,
        })
      )
      .catch((err) => reject(err));
  });
}

module.exports = {
  signIn,
  getSpotifyTokens,
  getMe,
};
