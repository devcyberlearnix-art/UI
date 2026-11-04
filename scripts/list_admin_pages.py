import json

with open('scratch/routes_extracted.json') as f:
    routes = json.load(f)

admin_routes = [r for r in routes if r['role'] == 'Admin']
print(f"Total Admin Routes: {len(admin_routes)}")
for idx, r in enumerate(admin_routes, 1):
    print(f"{idx:02d}. {r['path']} -> {r['element']}")

