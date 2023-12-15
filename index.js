const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3008;

// Replace with your Strava API credentials
const clientId = "your_client_id";
const clientSecret = "your_client_secret";
const redirectUri = "http://localhost:3000/auth/callback";

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send('<a href="/auth">Connect to Strava</a>');
});

app.get("/auth", (req, res) => {
  const authorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read_all`;
  res.redirect(authorizeUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  // Exchange the authorization code for an access token
  const tokenResponse = await axios.post(
    "https://www.strava.com/oauth/token",
    querystring.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const accessToken = tokenResponse.data.access_token;

  // Use the access token to get the user's activities
  const activitiesResponse = await axios.get(
    "https://www.strava.com/api/v3/athlete/activities",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const activities = activitiesResponse.data;

  // Display the list of activities
  res.json(activities);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
