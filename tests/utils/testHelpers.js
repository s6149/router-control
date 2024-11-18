const axios = require('axios');

const baseURL = process.env.API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${baseURL}/api`
});

module.exports = {
    api,
    baseURL
};