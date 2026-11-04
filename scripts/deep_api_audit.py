import os
import re
import json
from collections import defaultdict

UI_DIR = os.path.abspath('src')
BACKEND_DIR = os.path.abspath(r'C:\Users\SHIVASAI\OneDrive\Desktop\LMS')

# ==============================================================================
# 1. EXTRACT ALL UI API DEFINITIONS
# ==============================================================================

def extract_ui_apis():
    api_dir = os.path.join(UI_DIR, 'api')
    ui_apis = []

    # Regex patterns for axios/fetch calls in JS files
    # e.g., axiosInstance.get('/api/v1/courses', ...)
    # api.get('/courses')
    # get: (url) => ...
    method_pattern = re.compile(
        r'(?:axiosInstance|api|client|adminApi|authApi|courseApi|studentApi|instructorApi|cmsAdminApi|cmsPublicApi|paymentApi|cartApi|wishlistApi|notificationApi|couponApi|reviewApi|quizApi|liveClassApi|assignmentApi|orderApi)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*([`\'"][^`\'"]+[`\'"]|\`[^\`]+\`)',
        re.IGNORECASE
    )

    # Function declaration in object: methodName: (params) => axiosInstance.get(...)
    func_pattern = re.compile(
        r'([a-zA-Z0-9_]+)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>\s*(?:\{[^{}]*?)?(?:axiosInstance|client|api)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*([`\'"][^`\'"]+[`\'"]|\`[^\`]+\`)',
        re.IGNORECASE | re.DOTALL
    )

    # Standard function: export const methodName = async (...) => ...
    func_export_pattern = re.compile(
        r'export\s+(?:const|async\s+function|function)\s+([a-zA-Z0-9_]+)[^=]*=\s*(?:async\s*)?\([^)]*\)\s*=>[^{]*?(?:axiosInstance|client|api)\s*\.\s*(get|post|put|delete|patch)\s*\(\s*([`\'"][^`\'"]+[`\'"]|\`[^\`]+\`)',
        re.IGNORECASE | re.DOTALL
    )

    for root, _, files in os.walk(api_dir):
        for f in files:
            if not f.endswith('.js') and not f.endswith('.jsx'):
                continue
            fpath = os.path.join(root, f)
            rel_file = os.path.relpath(fpath, UI_DIR)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()

            # Find all endpoints mentioned
            lines = content.split('\n')
            for i, line in enumerate(lines):
                # Search for direct axios calls
                matches = re.findall(r'(?:axiosInstance|api|client)\.(get|post|put|delete|patch)\s*\(\s*([`\'"][^`\'"]+[`\'"])', line, re.IGNORECASE)
                for m_method, m_path in matches:
                    raw_path = m_path.strip('`\'"')
                    ui_apis.append({
                        'file': rel_file,
                        'line': i + 1,
                        'method': m_method.upper(),
                        'raw_path': raw_path,
                        'clean_path': normalize_endpoint_path(raw_path)
                    })

    # Also search for any direct axiosInstance calls outside src/api (e.g. in pages or hooks)
    for root, _, files in os.walk(UI_DIR):
        if 'node_modules' in root or 'dist' in root or os.path.join(UI_DIR, 'api') in root:
            continue
        for f in files:
            if not f.endswith('.js') and not f.endswith('.jsx'):
                continue
            fpath = os.path.join(root, f)
            rel_file = os.path.relpath(fpath, UI_DIR)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            lines = content.split('\n')
            for i, line in enumerate(lines):
                matches = re.findall(r'(?:axiosInstance|axios|fetch)\.(get|post|put|delete|patch)\s*\(\s*([`\'"][^`\'"]+[`\'"])', line, re.IGNORECASE)
                for m_method, m_path in matches:
                    raw_path = m_path.strip('`\'"')
                    if raw_path.startswith('/api') or raw_path.startswith('http') or raw_path.startswith('/'):
                        ui_apis.append({
                            'file': rel_file,
                            'line': i + 1,
                            'method': m_method.upper(),
                            'raw_path': raw_path,
                            'clean_path': normalize_endpoint_path(raw_path)
                        })

    return ui_apis

def normalize_endpoint_path(path):
    # Remove query string
    p = path.split('?')[0]
    # Remove trailing slash
    p = p.rstrip('/')
    # Normalize template literals ${id} or ${courseId} to {param}
    p = re.sub(r'\$\{[^}]+\}', '{param}', p)
    # Normalize :id or :courseId to {param}
    p = re.sub(r':[a-zA-Z0-9_]+', '{param}', p)
    # Normalize Spring Boot path variables {id}, {courseId}, etc. to {param}
    p = re.sub(r'{[a-zA-Z0-9_]+}', '{param}', p)
    # Strip base URL if present
    p = re.sub(r'^https?://[^/]+', '', p)
    return p

# ==============================================================================
# 2. EXTRACT UI USAGE (WHICH APIS ARE ACTUALLY IMPORTED/USED IN UI)
# ==============================================================================

def check_ui_usage(ui_apis):
    # Scan all components, pages, hooks
    ui_code_files = []
    for root, _, files in os.walk(UI_DIR):
        if 'node_modules' in root or 'dist' in root or '.git' in root or os.path.join(UI_DIR, 'api') in root:
            continue
        for f in files:
            if f.endswith('.js') or f.endswith('.jsx'):
                ui_code_files.append(os.path.join(root, f))

    all_ui_code = ""
    for f in ui_code_files:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            all_ui_code += "\n" + fp.read()

    for item in ui_apis:
        # Check if the path or a keyword is in the code
        clean_p = item['clean_path']
        base_endpoint = re.sub(r'\{param\}', '', clean_p).rstrip('/')
        if base_endpoint and len(base_endpoint) > 4 and base_endpoint in all_ui_code:
            item['used_in_ui'] = True
        elif item['file'] not in ['api/axiosInstance.js']:
            # If it's called directly in a page or hook, it's used
            item['used_in_ui'] = True
        else:
            item['used_in_ui'] = False

    return ui_apis

# ==============================================================================
# 3. EXTRACT ALL BACKEND CONTROLLER ENDPOINTS
# ==============================================================================

def extract_backend_apis():
    backend_apis = []

    # Discover microservice directories
    microservices = [
        d for d in os.listdir(BACKEND_DIR)
        if os.path.isdir(os.path.join(BACKEND_DIR, d)) and ('service' in d or 'gateway' in d or d in ['admin-service', 'user-service'])
    ]

    for ms in microservices:
        ms_dir = os.path.join(BACKEND_DIR, ms)
        for root, _, files in os.walk(ms_dir):
            for f in files:
                if not f.endswith('Controller.java') and not f.endswith('Resource.java') and not f.endswith('Endpoint.java'):
                    continue
                fpath = os.path.join(root, f)
                rel_file = os.path.relpath(fpath, BACKEND_DIR)
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                    code = fp.read()

                # Check if it's a RestController
                if '@RestController' not in code and '@Controller' not in code:
                    continue

                # Extract Class-level @RequestMapping
                class_mappings = [""]
                class_match = re.search(r'@RequestMapping\s*\(\s*(?:(?:value|path)\s*=\s*)?(["][^"]+["]|\{[^}]+\})', code)
                if class_match:
                    raw_class = class_match.group(1)
                    found_c = [p.strip('" \n\r') for p in re.findall(r'"([^"]*)"', raw_class)]
                    if found_c:
                        class_mappings = found_c

                # Extract all methods
                # @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping, @RequestMapping
                method_regex = re.compile(
                    r'@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\s*(\([^)]*?\))?',
                    re.IGNORECASE
                )

                for m in method_regex.finditer(code):
                    ann_type = m.group(1)
                    raw_path = m.group(2) or '""'
                    paths_list = [p.strip('" \n\r') for p in re.findall(r'"([^"]*)"', raw_path)]
                    if not paths_list:
                        paths_list = [""]

                    # Determine HTTP method
                    if ann_type.lower() == 'getmapping':
                        http_method = 'GET'
                    elif ann_type.lower() == 'postmapping':
                        http_method = 'POST'
                    elif ann_type.lower() == 'putmapping':
                        http_method = 'PUT'
                    elif ann_type.lower() == 'deletemapping':
                        http_method = 'DELETE'
                    elif ann_type.lower() == 'patchmapping':
                        http_method = 'PATCH'
                    else:
                        # Extract method from @RequestMapping(method = RequestMethod.GET)
                        ann_full = m.group(0)
                        method_attr = re.search(r'method\s*=\s*RequestMethod\.([A-Z]+)', ann_full)
                        http_method = method_attr.group(1) if method_attr else 'ALL'

                    for class_mapping in class_mappings:
                        for clean_m_path in paths_list:
                            full_path = ""
                            if class_mapping:
                                full_path = "/" + class_mapping.strip('/')
                            if clean_m_path:
                                full_path = full_path + "/" + clean_m_path.strip('/')
                            if not full_path:
                                full_path = "/"

                            backend_apis.append({
                                'microservice': ms,
                                'controller': f,
                                'file': rel_file,
                                'method': http_method,
                                'class_mapping': class_mapping,
                                'method_mapping': clean_m_path,
                                'full_path': full_path,
                                'clean_path': normalize_endpoint_path(full_path)
                            })

    return backend_apis

# ==============================================================================
# 4. CROSS-MATCH & AUDIT
# ==============================================================================

def run_audit():
    print("--- 1. Extracting UI APIs ---")
    ui_apis = extract_ui_apis()
    print(f"Total raw UI API invocations found: {len(ui_apis)}")

    # Deduplicate UI APIs by method + clean_path
    unique_ui = {}
    for item in ui_apis:
        key = (item['method'], item['clean_path'])
        if key not in unique_ui:
            unique_ui[key] = {
                'method': item['method'],
                'path': item['clean_path'],
                'files': set([item['file']]),
                'raw_samples': set([item['raw_path']])
            }
        else:
            unique_ui[key]['files'].add(item['file'])
            unique_ui[key]['raw_samples'].add(item['raw_path'])

    print(f"Unique UI API endpoints: {len(unique_ui)}")

    print("\n--- 2. Extracting Backend Controller APIs ---")
    backend_apis = extract_backend_apis()
    print(f"Total Backend Controller endpoints found: {len(backend_apis)}")

    unique_be = {}
    for item in backend_apis:
        key = (item['method'], item['clean_path'])
        if key not in unique_be:
            unique_be[key] = {
                'method': item['method'],
                'path': item['clean_path'],
                'microservices': set([item['microservice']]),
                'controllers': set([f"{item['microservice']} -> {item['controller']}"]),
                'full_paths': set([item['full_path']])
            }
        else:
            unique_be[key]['microservices'].add(item['microservice'])
            unique_be[key]['controllers'].add(f"{item['microservice']} -> {item['controller']}")
            unique_be[key]['full_paths'].add(item['full_path'])

    print(f"Unique Backend API endpoints: {len(unique_be)}")

    # MATCHING LOGIC
    # Note: UI endpoints typically start with /api/v1 or /api
    # Backend controllers might define /api/v1/... or just /courses depending on Gateway stripPrefix
    matched = []
    ui_only = []
    be_only = []

    # Create indexed lookup for backend
    be_paths_map = defaultdict(list)
    for (m, p), data in unique_be.items():
        # Clean variants
        be_paths_map[(m, p)].append(data)
        # Without /api or /api/v1
        p_no_api = re.sub(r'^/api/v\d+', '', p)
        p_no_api = re.sub(r'^/api', '', p_no_api)
        if p_no_api != p:
            be_paths_map[(m, p_no_api)].append(data)

    for (u_method, u_path), u_data in unique_ui.items():
        # Check exact match
        found = None
        if (u_method, u_path) in be_paths_map:
            found = be_paths_map[(u_method, u_path)]
        elif ('ALL', u_path) in be_paths_map:
            found = be_paths_map[('ALL', u_path)]
        else:
            # Try stripped /api/v1
            u_no_api = re.sub(r'^/api/v\d+', '', u_path)
            u_no_api = re.sub(r'^/api', '', u_no_api)
            if (u_method, u_no_api) in be_paths_map:
                found = be_paths_map[(u_method, u_no_api)]
            elif ('ALL', u_no_api) in be_paths_map:
                found = be_paths_map[('ALL', u_no_api)]
            else:
                # Try path with /api/v1 prepended
                u_with_api = "/api/v1" + u_no_api
                if (u_method, u_with_api) in be_paths_map:
                    found = be_paths_map[(u_method, u_with_api)]

        if found:
            matched.append({
                'ui_method': u_method,
                'ui_path': u_path,
                'ui_files': list(u_data['files']),
                'backend_matches': [
                    {
                        'microservices': list(d['microservices']),
                        'controllers': list(d['controllers']),
                        'full_paths': list(d['full_paths'])
                    } for d in found
                ]
            })
        else:
            ui_only.append({
                'method': u_method,
                'path': u_path,
                'files': list(u_data['files']),
                'sample': list(u_data['raw_samples'])[0]
            })

    output = {
        'total_ui_endpoints': len(unique_ui),
        'total_backend_endpoints': len(unique_be),
        'matched_count': len(matched),
        'ui_missing_in_backend_count': len(ui_only),
        'matched': matched,
        'ui_missing_in_backend': ui_only
    }

    with open('scratch/api_audit_results.json', 'w', encoding='utf-8') as fp:
        json.dump(output, fp, indent=2)

    print(f"\n==========================================")
    print(f"SUMMARY OF FINDINGS:")
    print(f"Total Unique UI Endpoints: {len(unique_ui)}")
    print(f"Total Unique Backend Endpoints: {len(unique_be)}")
    print(f"Successfully Matched & Implemented: {len(matched)}")
    print(f"UI Endpoints Missing in Backend: {len(ui_only)}")
    print(f"==========================================")

if __name__ == '__main__':
    run_audit()
