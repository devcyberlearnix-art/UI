const fs = require('fs');
const path = require('path');

const p = path.resolve('src/pages/CourseDetail.jsx');
let content = fs.readFileSync(p, 'utf8');

// 1. Add useQueryClient import
if (!content.includes('useQueryClient')) {
  content = content.replace(
    "import React, { useState, useEffect, useCallback } from 'react';",
    "import React, { useState, useEffect, useCallback } from 'react';\nimport { useQueryClient } from '@tanstack/react-query';"
  );
}

// 2. Add wishlistLoading and cartLoading states
const oldStates = `  const [isWishlisted, setIsWishlisted] = useState(false);`;
const newStates = `  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const queryClient = useQueryClient();`;

// 3. Update toggleWishlist and addToCart
const oldToggle = `  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save tracks');
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(courseId);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist({
          courseId: parseInt(courseId),
          instructorId: course?.instructorId,
        });
        setIsWishlisted(true);
        toast.success('Saved to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    try {
      await cartApi.addToCart({
        courseId: parseInt(courseId),
        instructorId: course?.instructorId,
        courseName: course?.title,
        price: course?.price,
      });
      toast.success('Added to order cart');
      navigate('/cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };`;

const newToggle = `  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save tracks');
      navigate('/login');
      return;
    }

    if (wishlistLoading) return;
    setWishlistLoading(true);

    const targetWishlistedState = !isWishlisted;
    // Optimistic UI state
    setIsWishlisted(targetWishlistedState);

    try {
      if (!targetWishlistedState) {
        await wishlistApi.removeFromWishlist(courseId);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist({
          courseId: parseInt(courseId),
          instructorId: course?.instructorId,
        });
        toast.success('Saved to wishlist');
      }
      try {
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist-check', courseId] });
      } catch (_) {}
    } catch (err) {
      // Revert optimistic state on genuine failure
      setIsWishlisted(!targetWishlistedState);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    if (cartLoading) return;
    setCartLoading(true);

    try {
      await cartApi.addToCart({
        courseId: parseInt(courseId),
        instructorId: course?.instructorId,
        courseName: course?.title,
        price: course?.price,
      });
      toast.success('Added to order cart');
      navigate('/cart');
    } catch (err) {
      if (err.response?.status === 409) {
        toast('Course is already in your cart', { icon: '🛒' });
        navigate('/cart');
        return;
      }
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };`;

// 4. Update the Wishlist button JSX
const oldBtn = `                  <button
                    type="button"
                    onClick={toggleWishlist}
                    className={\`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer \${
                      isWishlisted
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-[#0F0F13] border-white/[0.04] text-[#8E8E93] hover:text-white'
                    }\`}
                  >
                    <Heart className={\`w-3.5 h-3.5 \${isWishlisted ? 'fill-current' : ''}\`} />
                    <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>`;

const newBtn = `                  <button
                    type="button"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={\`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer \${
                      wishlistLoading ? 'opacity-60 cursor-not-allowed' : ''
                    } \${
                      isWishlisted
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-[#0F0F13] border-white/[0.04] text-[#8E8E93] hover:text-white'
                    }\`}
                  >
                    <Heart className={\`w-3.5 h-3.5 \${isWishlisted ? 'fill-current' : ''}\`} />
                    <span>{wishlistLoading ? 'Syncing...' : (isWishlisted ? 'Saved' : 'Wishlist')}</span>
                  </button>`;

function replaceNorm(str, o, n) {
  const normStr = str.replace(/\r\n/g, '\n');
  const normO = o.replace(/\r\n/g, '\n');
  const normN = n.replace(/\r\n/g, '\n');
  if (!normStr.includes(normO)) {
    console.error('Target not found for replace!');
    return str;
  }
  return normStr.replace(normO, normN).replace(/\n/g, '\r\n');
}

content = replaceNorm(content, oldStates, newStates);
content = replaceNorm(content, oldToggle, newToggle);
content = replaceNorm(content, oldBtn, newBtn);

fs.writeFileSync(p, content, 'utf8');
console.log('✅ CourseDetail.jsx patched with debounced wishlist & cart guards');

