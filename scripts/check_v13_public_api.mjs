import axios from 'axios';

async function main() {
  const res = await axios.get('http://localhost:8079/api/v1/public/landing-page');
  console.log('HTTP Status:', res.status);
  console.log('Published Version:', res.data?.data?.publishedVersion);
  console.log('Page Status:', res.data?.data?.pageStatus);
  console.log('Published At:', res.data?.data?.publishedAt);
  console.log('Website Statistics (Ordered):');
  const stats = res.data?.data?.statistics || [];
  stats.sort((a,b) => a.displayOrder - b.displayOrder);
  stats.forEach((s, idx) => {
    console.log(`[${idx}] Order: ${s.displayOrder} | ID: ${s.id} | Label: '${s.label}' | Value: '${s.value}' | IconName: '${s.iconName}' | Subtext: ${s.subtext}`);
  });
}

main().catch(console.error);

