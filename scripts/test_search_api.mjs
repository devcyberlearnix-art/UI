import axios from 'axios';

async function test() {
  const tests = [
    { search: 'Python' },
    { search: 'React' },
    { search: 'Cloud' },
    { search: 'Java' },
    { search: 'Architecture' },
    { search: 'Machine Learning' },
    { category: 'AI/ML' },
    { level: 'Beginner' },
    { sort: 'POPULAR' },
    { search: 'data', level: 'Intermediate' }
  ];
  for (const t of tests) {
    const res = await axios.get('http://localhost:8080/api/v1/courses/list', { params: { ...t, size: 3 } });
    console.log(JSON.stringify(t), '-> total:', res.data.data.pagination.totalElements, 'results returned:', res.data.data.courses.length);
  }
}
test().catch(console.error);

