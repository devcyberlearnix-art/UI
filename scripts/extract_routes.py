import re
import json

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for Route components
route_pattern = re.compile(r'<Route\s+path=[\'\"]([^\'\"]+)[\'\"]\s+element=\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', re.DOTALL)
matches = route_pattern.findall(content)

results = []
for i, (path, element) in enumerate(matches, 1):
    elem_str = ' '.join(element.strip().split())
    
    # Categorize by role/section
    if path.startswith('/admin'):
        role = 'Admin'
        access = 'Role: ADMIN'
    elif path.startswith('/instructor'):
        role = 'Instructor'
        access = 'Role: INSTRUCTOR'
    elif path.startswith('/parent'):
        role = 'Parent'
        access = 'Role: PARENT / GUARDIAN'
    elif path.startswith('/student'):
        role = 'Student'
        access = 'Role: STUDENT'
    elif path == '/profile':
        role = 'Universal Authenticated'
        access = 'Authenticated User'
    elif path == '*':
        role = 'Fallback'
        access = 'Public'
    else:
        role = 'Public Storefront / Auth'
        access = 'Public / Unauthenticated'
        
    results.append({
        'index': i,
        'path': path,
        'element': elem_str,
        'role': role,
        'access': access
    })

print(f"Extracted {len(results)} routes.")
with open('scratch/routes_extracted.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, indent=2)

print("Saved to scratch/routes_extracted.json")
