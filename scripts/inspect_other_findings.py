import json

with open('scratch/slop_findings.json', encoding='utf-8') as f:
    findings = json.load(f)

# Group by file
by_file = {}
for item in findings:
    f = item['file']
    by_file.setdefault(f, []).append(item)

for fname, items in by_file.items():
    if any(k in fname for k in ['Courses.jsx', 'LiveDiscussionHub.jsx', 'AuthContext.jsx', 'Cart.jsx', 'Checkout.jsx']):
        print(f"\n=== {fname} ({len(items)} items) ===")
        for it in items:
            safe = it['content'].encode('ascii', 'backslashreplace').decode('ascii')
            print(f"L{it['line']}: {safe}")

