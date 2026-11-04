import json

with open('scratch/slop_findings.json', encoding='utf-8') as f:
    findings = json.load(f)

files_to_check = [
    'src/pages/admin/Instructors.jsx',
    'src/pages/student/StudentDashboard.jsx',
    'src/pages/admin/Coupons.jsx',
    'src/pages/admin/AdminRegister.jsx',
    'src/pages/admin/RegistrationSuccess.jsx'
]

for target in files_to_check:
    print(f"\n=== {target} ===")
    for item in findings:
        if item['file'] == target:
            safe_text = item['content'].encode('ascii', 'backslashreplace').decode('ascii')
            print(f"L{item['line']}: {safe_text}")
