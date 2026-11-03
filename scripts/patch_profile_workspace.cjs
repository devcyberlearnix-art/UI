const fs = require('fs');

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/student/ProfileWorkspace.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to \n for consistent replacement
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Clean up if (loading)
const oldLoadingPattern = /if \(loading\) \{[\s\S]*?<\/GlobalLayoutWrapper>\s*\);\s*\}/;

const newLoadingBlock = `if (loading) {
    return (
      <GlobalLayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#8E8E93]">
            Hydrating Identity Matrix...
          </p>
        </div>
      </GlobalLayoutWrapper>
    );
  }`;

if (oldLoadingPattern.test(norm)) {
  norm = norm.replace(oldLoadingPattern, newLoadingBlock);
  console.log('Cleaned up if (loading) block successfully!');
} else {
  console.error('Failed to match if (loading) block');
}

// 2. Add EmailChangeModal at the bottom alongside ProfilePhotoModal
const photoModalPattern = /(<ProfilePhotoModal[\s\S]*?\/>)(\s*<\/GlobalLayoutWrapper>\s*\);\s*\})/;

const emailModalBlock = `$1

      {/* Email Change Modal */}
      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={profile?.email || temp?.email || user?.email || ''}
        onEmailUpdated={(newMail) => {
          setProfile(p => (p ? { ...p, email: newMail } : p));
          setTemp(t => (t ? { ...t, email: newMail } : t));
        }}
      />$2`;

if (photoModalPattern.test(norm)) {
  norm = norm.replace(photoModalPattern, emailModalBlock);
  console.log('Placed EmailChangeModal at bottom of workspace successfully!');
} else {
  console.error('Failed to match ProfilePhotoModal at bottom');
}

// 3. Fix alt={profile.name} to alt={profile?.name || 'Profile'}
norm = norm.replace('alt={profile.name}', "alt={profile?.name || 'Profile'}");

// Write back with original line endings
const finalContent = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('ProfileWorkspace.jsx patch completed!');

