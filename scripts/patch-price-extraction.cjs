const fs = require('fs');
const path = require('path');

const LMS_ROOT = 'C:\\Users\\SHIVASAI\\OneDrive\\Desktop\\LMS';
const srvPath = path.join(LMS_ROOT, 'order-service', 'src', 'main', 'java', 'com', 'lms', 'orderservice', 'service', 'OrderService.java');
let srvContent = fs.readFileSync(srvPath, 'utf8').replace(/\r\n/g, '\n');

const oldCheck = `                if (response.getBody() != null) {
                    Object dataObj = response.getBody().get("data");
                    if (dataObj instanceof java.util.Map<?, ?> dataMap) {
                        Object priceObj = dataMap.get("price");
                        if (priceObj instanceof Number num) {
                            total += num.doubleValue();
                        }
                    }
                }`;

const newCheck = `                if (response.getBody() != null) {
                    Object priceObj = response.getBody().get("price");
                    if (priceObj == null) {
                        Object dataObj = response.getBody().get("data");
                        if (dataObj instanceof java.util.Map<?, ?> dataMap) {
                            priceObj = dataMap.get("price");
                        }
                    }
                    if (priceObj instanceof Number num) {
                        total += num.doubleValue();
                    }
                }`;

if (srvContent.includes(oldCheck)) {
  srvContent = srvContent.replace(oldCheck, newCheck);
  fs.writeFileSync(srvPath, srvContent, 'utf8');
  console.log('✅ validateAndGetCoursesPrice patched to parse both top-level price and data.price');
} else {
  console.log('ℹ️ Already patched or pattern differs');
}
