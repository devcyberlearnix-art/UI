const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'hooks', 'useNotifications.js');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useSafeAuth')) {
  content = content.replace(
    "import toast from 'react-hot-toast';",
    "import toast from 'react-hot-toast';\nimport { useSafeAuth } from '../context/AuthContext';"
  );
}

// In useNotifications
content = content.replace(
  'export function useNotifications(userId = null) {\n  const queryClient = useQueryClient();',
  'export function useNotifications(userId = null) {\n  const queryClient = useQueryClient();\n  const { user } = useSafeAuth();'
);
// Also CRLF
content = content.replace(
  'export function useNotifications(userId = null) {\r\n  const queryClient = useQueryClient();',
  'export function useNotifications(userId = null) {\r\n  const queryClient = useQueryClient();\r\n  const { user } = useSafeAuth();'
);

content = content.replace(
  '    staleTime: 1000 * 5,\n    gcTime: 1000 * 60 * 15,\n  });',
  '    enabled: Boolean(user && user.id && user.id !== \'guest\'),\n    staleTime: 1000 * 5,\n    gcTime: 1000 * 60 * 15,\n  });'
);
content = content.replace(
  '    staleTime: 1000 * 5,\r\n    gcTime: 1000 * 60 * 15,\r\n  });',
  '    enabled: Boolean(user && user.id && user.id !== \'guest\'),\r\n    staleTime: 1000 * 5,\r\n    gcTime: 1000 * 60 * 15,\r\n  });'
);

content = content.replace(
  '    refetchInterval: 15000,\n    staleTime: 1000 * 5,\n  });',
  '    enabled: Boolean(user && user.id && user.id !== \'guest\'),\n    refetchInterval: 15000,\n    staleTime: 1000 * 5,\n  });'
);
content = content.replace(
  '    refetchInterval: 15000,\r\n    staleTime: 1000 * 5,\r\n  });',
  '    enabled: Boolean(user && user.id && user.id !== \'guest\'),\r\n    refetchInterval: 15000,\r\n    staleTime: 1000 * 5,\r\n  });'
);

// In useNotificationPreferences
content = content.replace(
  'export function useNotificationPreferences() {\n  const queryClient = useQueryClient();',
  'export function useNotificationPreferences() {\n  const queryClient = useQueryClient();\n  const { user } = useSafeAuth();'
);
content = content.replace(
  'export function useNotificationPreferences() {\r\n  const queryClient = useQueryClient();',
  'export function useNotificationPreferences() {\r\n  const queryClient = useQueryClient();\r\n  const { user } = useSafeAuth();'
);

content = content.replace(
  '    staleTime: 1000 * 60 * 10,\n  });',
  '    enabled: Boolean(user && user.id && user.id !== \'guest\'),\n    staleTime: 1000 * 60 * 10,\n  });'
);
content = content.replace(
  '    staleTime: 1000 * 60 * 10,\r\n  });',
  '    enabled: Boolean(user && user.id && user.id !== \'guest\'),\r\n    staleTime: 1000 * 60 * 10,\r\n  });'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Patched useNotifications.js');

