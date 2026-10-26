const fs = require('fs');
const path = require('path');

const LMS_ROOT = 'C:\\Users\\SHIVASAI\\OneDrive\\Desktop\\LMS';

// 1. Patch OrderController.java to enforce authenticated userId for non-admins
const ctrlPath = path.join(LMS_ROOT, 'order-service', 'src', 'main', 'java', 'com', 'lms', 'orderservice', 'controller', 'OrderController.java');
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8').replace(/\r\n/g, '\n');

const oldCtrlCreate = `        String userId = (request != null && request.getUserId() != null && !request.getUserId().isBlank())
                ? request.getUserId()
                : (authentication != null ? authentication.getName() : null);`;

const newCtrlCreate = `        String authUserId = authentication != null ? authentication.getName() : null;
        String userId;
        if (isAdmin(authentication) && request != null && request.getUserId() != null && !request.getUserId().isBlank()) {
            userId = request.getUserId();
        } else {
            userId = authUserId;
        }`;

if (ctrlContent.includes(oldCtrlCreate)) {
  ctrlContent = ctrlContent.replace(oldCtrlCreate, newCtrlCreate);
  fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
  console.log('✅ OrderController.java patched to prevent client-supplied userId spoofing');
} else {
  console.log('ℹ️ OrderController.java already patched or pattern differs');
}

// 2. Patch OrderService.java to validate client-supplied totalAmount against authoritative course prices
const srvPath = path.join(LMS_ROOT, 'order-service', 'src', 'main', 'java', 'com', 'lms', 'orderservice', 'service', 'OrderService.java');
let srvContent = fs.readFileSync(srvPath, 'utf8').replace(/\r\n/g, '\n');

const oldSrvTotal = `        // 3) Apply coupon (optional) per course item using coupon-service validate API
        String couponCode = request.getCouponCode();
        Double requestedTotal = request.getTotalAmount();
        double baseTotal;
        if (requestedTotal != null && requestedTotal > 0.0) {
            baseTotal = requestedTotal;
        } else {
            baseTotal = (cartTotal != null && cartTotal > 0.0) ? cartTotal : coursePricesTotal;
        }
        double finalTotal = baseTotal;`;

const newSrvTotal = `        // 3) Apply coupon (optional) per course item using coupon-service validate API
        String couponCode = request.getCouponCode();
        Double requestedTotal = request.getTotalAmount();
        double baseTotal = coursePricesTotal;
        if (baseTotal <= 0.0 && cartTotal != null && cartTotal > 0.0) {
            baseTotal = cartTotal;
        }

        // Backend validation: Do not trust unverified client-supplied total without validation
        if (requestedTotal != null && requestedTotal > 0.0) {
            if (baseTotal > 0.0 && Math.abs(requestedTotal - baseTotal) > 0.05 && (couponCode == null || couponCode.isBlank())) {
                logger.warn("Order total tampering detected! Client requested {}, but verified course total is {}",
                        requestedTotal, baseTotal);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Order total mismatch: client total (" + requestedTotal + ") does not match verified course price (" + baseTotal + ")");
            }
        }
        double finalTotal = baseTotal;`;

if (srvContent.includes(oldSrvTotal)) {
  srvContent = srvContent.replace(oldSrvTotal, newSrvTotal);
  fs.writeFileSync(srvPath, srvContent, 'utf8');
  console.log('✅ OrderService.java patched with authoritative price and total validation');
} else {
  console.log('ℹ️ OrderService.java already patched or pattern differs');
}
