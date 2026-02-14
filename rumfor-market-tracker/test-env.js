// Debug script to check env variables
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1')