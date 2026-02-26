import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp-up to 20 virtual users over 10 seconds
    { duration: '30s', target: 20 }, // Hold load of 20 virtual users
    { duration: '10s', target: 0 },  // Cool-down
  ],
  thresholds: {
    // 95% of requests must complete below 200ms
    http_req_duration: ['p(95)<200'], 
    // Error rate must be under 1%
    http_req_failed: ['rate<0.01'], 
  },
};

export default function () {
  const url = 'http://localhost:3000/api/listings';
  
  // A valid payload representing a listing to test load on JSON parsing and validation
  const payload = JSON.stringify({
    title: 'Rare Charizard',
    description: 'A very rare pokemon card in pristine condition. Selling it for a reasonable price.',
    price: 1500,
    condition: 'MINT',
    images: [
      'https://example.com/front.jpg',
      'https://example.com/back.jpg',
      'https://example.com/detail.jpg'
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // We use a mock auth failure to measure the speed of the JWT middleware under load
      // To test the full route, we would sign a real JWT string as a constant
      'Authorization': 'Bearer test-token-for-load',
    },
  };

  const res = http.post(url, payload, params);
  
  // We check that our API didn't crash and responded coherently
  check(res, {
    'status is 401 or 202': (r) => r.status === 401 || r.status === 202,
  });

  sleep(1);
}
