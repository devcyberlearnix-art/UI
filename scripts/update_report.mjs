import fs from 'fs';

let content = fs.readFileSync('docs/asivo-2/ADMIN_PAGES_VERIFICATION_REPORT.md', 'utf8');
content = content.replace(
  '| `03_admin_users.png` | `/admin/users` | User Governance & Access Directory | User table, role badges, suspension toggle, identity filters | **VERIFIED (100% HEALTH)** |',
  '| `03_admin_users.png` | `/admin/users` | User Governance & Access Directory | Restored button contrast (Sync Telemetry, Export CSV), added + Provision User modal, corrected light-mode white text | **VERIFIED (100% HEALTH)** |'
);

const newFixSection = `
### Fix 7: Invisible Buttons & Text Contrast on User Governance ([Users.jsx](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin/Users.jsx))
- **Symptom:** In the top header card of \`/admin/users\`, the buttons \`Sync Telemetry\` and \`Export CSV\` had \`text-white/70\` on \`bg-[#FAF7F2]\` cream backgrounds, causing the text to be completely washed out and invisible. In addition, the metric count \`263\` and modal fields were hardcoded with \`text-white\` in light mode.
- **Root Cause:** Incomplete dark/light theme tokens left over from legacy dark dashboard styling.
- **Resolution:** Replaced action button styles with crisp borders, visible \`#5B3E57\` plum icons, and \`#282521\` dark slate text. Added a dedicated primary \`+ Provision User\` modal with candidate creation workflow. Corrected all modal and matrix labels to support theme-aware contrast.
`;

if (!content.includes('Fix 7: Invisible Buttons')) {
  content = content + newFixSection;
}

fs.writeFileSync('docs/asivo-2/ADMIN_PAGES_VERIFICATION_REPORT.md', content, 'utf8');
console.log('Report updated with Fix 7');

