/*
* Shared settings
*/
function checkForEnvVar(varName) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

const requiredENV = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_ENCRYPTION_SECRET: process.env.SPOTIFY_ENCRYPTION_SECRET,

  JWT_SECRET: process.env.JWT_SECRET
};

Object.keys(requiredENV).forEach((varName) => checkForEnvVar(varName));

module.exports = {
  SPOTIFY_SCOPES: [
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-read',
    'user-follow-read',
    'user-library-modify',
    'user-top-read',
    'user-read-currently-playing',
    'user-read-recently-played',
    'ugc-image-upload',
    'user-read-birthdate',
    'user-read-email'
  ].join(' '),

  ...requiredENV
};