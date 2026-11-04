import json

with open('scratch/api_audit_results.json') as f:
    data = json.load(f)

print(f"Matched: {data['matched_count']}")
print(f"Missing in Backend: {data['ui_missing_in_backend_count']}")

by_file = {}
for item in data['ui_missing_in_backend']:
    for f in item['files']:
        by_file.setdefault(f, []).append((item['method'], item['path']))

for f, apis in sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"\n{f} ({len(apis)} unmatched):")
    for m, p in apis[:10]:
        print(f"  {m} {p}")
