import axios from 'axios';
import fs from 'fs';

async function retrieveOrder() {
  const creds = JSON.parse(fs.readFileSync('scripts/browser-student-creds.json'));
  const orderId = '3e4cdfb3-97a6-48dd-be61-2eeb74829f5a';

  const client = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { Authorization: `Bearer ${creds.token}` }
  });

  const getByIdRes = await client.get(`/api/v1/orders/${orderId}`);
  console.log('GET /api/v1/orders/' + orderId + ' Status:', getByIdRes.status);
  console.log('GET /api/v1/orders/' + orderId + ' Response:\n', JSON.stringify(getByIdRes.data, null, 2));

  const getAllRes = await client.get('/api/v1/orders');
  console.log('GET /api/v1/orders Status:', getAllRes.status);
  console.log('GET /api/v1/orders Response:\n', JSON.stringify(getAllRes.data, null, 2));
}

retrieveOrder().catch(console.error);
