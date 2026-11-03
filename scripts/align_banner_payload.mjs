import fs from 'fs';

const p = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin/BannerManagement.jsx';
let c = fs.readFileSync(p, 'utf8');

const oldPayload = `      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        imageUrl: formData.imageUrl.trim(),
        mobileImageUrl: formData.mobileImageUrl?.trim() || formData.imageUrl.trim(),
        actionUrl: formData.actionUrl?.trim() || "",
        buttonText: formData.buttonText?.trim() || "Explore Now",
        position: formData.position || "home",
        status: formData.status || "active",
        targetType: formData.targetType || "COURSE",
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };`;

const newPayload = `      const normalizedCtaUrl = formData.actionUrl?.trim() && formData.actionUrl.startsWith("http")
        ? formData.actionUrl.trim()
        : ("https://cyberlearnix.com" + (formData.actionUrl?.startsWith("/") ? formData.actionUrl : "/courses"));

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        imageUrl: formData.imageUrl.trim(),
        mobileImageUrl: formData.mobileImageUrl?.trim() || formData.imageUrl.trim(),
        actionUrl: formData.actionUrl?.trim() || "",
        buttonText: formData.buttonText?.trim() || "Explore Now",
        ctaText: formData.buttonText?.trim() || "Explore Now",
        ctaUrl: normalizedCtaUrl,
        displayOrder: editingBanner?.displayOrder || 1,
        position: formData.position || "home",
        status: (formData.status || "ACTIVE").toUpperCase(),
        targetType: formData.targetType || "COURSE",
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };`;

if (c.includes(oldPayload)) {
  c = c.replace(oldPayload, newPayload);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Successfully aligned BannerManagement.jsx payload with backend DTO');
} else {
  console.log('Old payload block not found or already updated');
}

