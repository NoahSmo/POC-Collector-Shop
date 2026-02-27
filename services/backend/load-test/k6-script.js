import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Ramp-up to 20 virtual users over 10 seconds
    { duration: '30s', target: 100 }, // Hold load of 20 virtual users
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

  // Pre-signed JWT using the local dev secret ('poc-super-secret-key-for-local-dev')
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsb2FkdGVzdC11c2VyIiwiZW1haWwiOiJsb2FkdGVzdEB0ZXN0LmNvbSIsIm5hbWUiOiJMb2FkIFRlc3RlciIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyMTkxNjEwfQ.xa0KKtZzBNyLxqL5AJrjmol4Fv7o7gRwJzL6eOAdcEI';

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);
  
  // We check that our API responded with a success status
  check(res, {
    'status is 202': (r) => r.status === 202,
  });

  sleep(1);
}
