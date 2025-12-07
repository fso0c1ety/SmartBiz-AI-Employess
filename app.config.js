import 'dotenv/config';
import appJson from './app.json';

// Build-time config for Expo (works with Expo Go and production builds)
export default ({ config }) => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ||
      process.env.REACT_APP_API_URL ||
      'http://192.168.0.27:5001/api',
  },
});
