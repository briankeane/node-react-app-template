const Config = {
  apiBaseURL: process.env.REACT_APP_API_BASE_URL,
  websiteBaseURL: process.env.REACT_APP_WEBSITE_BASE_URL,
  spotifyCallbackURI: encodeURI(
    `${process.env.REACT_APP_API_BASE_URL}/v1/spotify/auth/authorize?redirect_uri=${process.env.REACT_APP_WEBSITE_BASE_URL}/callbacks/spotify`
  ),
};

export default Config;
