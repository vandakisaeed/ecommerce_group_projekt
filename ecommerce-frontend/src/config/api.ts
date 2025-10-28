const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
  baseUrl: API_URL,
  endpoints: {
    products: `${API_URL}/products`,
    cart: `${API_URL}/api/cart`,
    auth: `${API_URL}/api/auth`
  }
};