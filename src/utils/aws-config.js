// src/utils/aws-config.js
import { AWS } from 'aws-sdk';

const initAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION
  });
};

export default initAWS;