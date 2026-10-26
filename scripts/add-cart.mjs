import axios from 'axios';
import fs from 'fs';

async function add() {
  const creds = JSON.parse(fs.readFileSync('scripts/browser-student-creds.json'));
  const res = await axios.post('http://localhost:8080/api/v1/cart', {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0
  }, { headers: { Authorization: `Bearer ${creds.token}` } });
  console.log('Cart add status:', res.status, res.data);
}

add().catch(console.error);
