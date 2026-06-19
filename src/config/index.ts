const backendBaseUrl = process.env.REACT_APP_BACKEND_BASE_URL || process.env.BACKEND_BASE_URL || 'http://localhost:8000';

const envConfig = {
    backend_base_url: backendBaseUrl,
    api_url: `${backendBaseUrl}/api/v1`
}

export default envConfig