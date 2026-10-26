const fs = require('fs');
const path = require('path');

const LMS_ROOT = 'C:\\Users\\SHIVASAI\\OneDrive\\Desktop\\LMS';
const filePath = path.join(LMS_ROOT, 'coupon-service', 'src', 'main', 'java', 'com', 'lms', 'coupon_service', 'service', 'CouponServiceImpl.java');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Fix in redeemCoupon:
const badChunk = `        Coupon coupon;
        try {
            coupon = findByCode(request.getCouponCode());
        } catch (Exception ex) {
            return buildValidationError("Coupon not found: " + request.getCouponCode());
        }`;

const goodRedeem = `        Coupon coupon;
        try {
            coupon = findByCode(request.getCouponCode());
        } catch (Exception ex) {
            throw new RuntimeException("Coupon not found: " + request.getCouponCode());
        }`;

const idx = content.lastIndexOf(badChunk);
if (idx !== -1) {
  content = content.substring(0, idx) + goodRedeem + content.substring(idx + badChunk.length);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Corrected redeemCoupon return type in CouponServiceImpl.java');
} else {
  console.log('ℹ️ Already corrected or not found');
}
