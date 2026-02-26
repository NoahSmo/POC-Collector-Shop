const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@collector.shop',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Logged in as admin");
    
    const pendingRes = await axios.get('http://localhost:3000/api/products/pending', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Pending products:", pendingRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
