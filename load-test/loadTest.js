import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1000,              // 10 users
  duration: '1s',       // 10 seconds
};

export default function () {
  const url = 'http://localhost:5000/api/auth/register';

  const payload = JSON.stringify({
    name: `Test User ${__VU}`,
    email: `test${__VU}_${__ITER}@gmail.com`,
    password: '123456',
    
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(url, payload, params);

  check(response, {
    'status is 200 or 201': (r) =>
      r.status === 200 || r.status === 201,
  });

  console.log(`VU: ${__VU}, Status: ${response.status}`);
}