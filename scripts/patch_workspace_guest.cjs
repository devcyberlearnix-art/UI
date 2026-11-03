const fs = require('fs');
let content = fs.readFileSync('src/pages/student/ShoppingCartWorkspace.jsx', 'utf8');

const oldRemove = 'mutationFn: async (courseId) => await cartApi.removeFromCart(courseId),';
const newRemove = `mutationFn: async (courseId) => {
      if (!isAuth) {
        const local = JSON.parse(localStorage.getItem('lms_cart') || '[]');
        const updated = local.filter((c) => String(c.id || c.courseId) !== String(courseId));
        localStorage.setItem('lms_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('cartUpdated'));
        return { success: true };
      }
      return await cartApi.removeFromCart(courseId);
    },`;

content = content.replace(oldRemove, newRemove);

const oldCheckoutCheck = 'if (!cart?.courses || cart.courses.length === 0) {';
const newCheckoutCheck = `if (!isAuth) {
      toast('Please sign in or register to complete your purchase.', { icon: '🔑' });
      navigate('/login?redirect=/cart');
      return;
    }
    if (!cart?.courses || cart.courses.length === 0) {`;

content = content.replace(oldCheckoutCheck, newCheckoutCheck);
fs.writeFileSync('src/pages/student/ShoppingCartWorkspace.jsx', content, 'utf8');
console.log('Patched ShoppingCartWorkspace guest operations');

