import os
import re
import json

patterns = [
    ('EMOJI', re.compile(r'[\u2600-\u27BF\U0001F300-\U0001F9FF]')),
    ('PURPLE_GLOW', re.compile(r'(shadow-purple|drop-shadow-purple|glow-purple)')),
    ('HYPE_WORDS', re.compile(r'\b(supercharge|revolutionize|unleash your potential|magic|magical)\b', re.IGNORECASE)),
    ('GRADIENT_TEXT', re.compile(r'bg-clip-text\s+text-transparent\s+bg-gradient-to-r\s+from-purple'))
]

results = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.jsx', '.js', '.tsx', '.ts')):
            path = os.path.join(root, f).replace('\\', '/')
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
                for num, line in enumerate(lines, 1):
                    for name, pat in patterns:
                        if pat.search(line):
                            results.append({
                                'type': name,
                                'file': path,
                                'line': num,
                                'content': line.strip()
                            })

print(f"Total findings: {len(results)}")
with open('scratch/slop_findings.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, indent=2, ensure_ascii=False)

by_type = {}
by_file = {}
for r in results:
    by_type[r['type']] = by_type.get(r['type'], 0) + 1
    by_file[r['file']] = by_file.get(r['file'], 0) + 1

print("\nBy Type:")
for k, v in by_type.items():
    print(f"  {k}: {v}")

print(f"\nTop 10 Files with Findings:")
for f, count in sorted(by_file.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"  {count} in {f}")

