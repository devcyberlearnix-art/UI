const fs = require('fs');

// 1. Patch PaymentService.java
const paymentServiceFile = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/service/PaymentService.java';
let psContent = fs.readFileSync(paymentServiceFile, 'utf8').replace(/\r\n/g, '\n');

const oldHandleCallback = `    public void handleCallback(String status,
                               String txnId,
                               String amount,
                               String productInfo,
                               String firstName,
                               String email,
                               String hash,
                               String payuId) {

        if (txnId == null || txnId.isBlank() ||
                status == null || status.isBlank()) {
            throw new BadRequestException("Invalid callback data");
        }

        Payment payment = paymentRepository.findByTxnId(txnId)
                .orElseThrow(() -> new BadRequestException("Payment not found"));

        String normalizedAmount = normalizeAmount(amount, payment.getAmount());
        String normalizedProductInfo = getFirstNonBlank(productInfo, payment.getProductInfo());
        String normalizedFirstName = getFirstNonBlank(firstName, payment.getFirstName());
        String normalizedEmail = getFirstNonBlank(email, payment.getEmail());

        // 1) Validate with callback payload values
        boolean isValid = payUHashService.validatePaymentHash(
                status,
                txnId,
                normalizedAmount,
                normalizedProductInfo,
                normalizedFirstName,
                normalizedEmail,
                hash
        );
        // 2) Fallback for minor callback formatting differences in manual tests
        if (!isValid) {
            isValid = payUHashService.validatePaymentHash(
                    status,
                    txnId,
                    String.format("%.2f", payment.getAmount()),
                    payment.getProductInfo(),
                    payment.getFirstName(),
                    payment.getEmail(),
                    hash
            );
        }

        if (!isValid) {
            throw new BadRequestException("Invalid PayU hash");
        }

        payment.setPayuPaymentId(payuId);

        if ("success".equalsIgnoreCase(status)) {
            payment.setStatus(PaymentStatus.SUCCESS);

            // ✅ ENROLL STUDENT IN COURSE (after successful payment)
            try {
                Long courseId = Long.parseLong(payment.getCourseId());
                UUID studentId = UUID.fromString(payment.getPayerUserId());
                enrollmentClient.enrollStudentAfterPayment(courseId, studentId);
            } catch (IllegalArgumentException e) {
                System.err.println("⚠️ Invalid courseId or studentId format for enrollment: " + e.getMessage());
                // Continue with payment processing even if enrollment fails - can be retried
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
    }`;

const newHandleCallback = `    public void handleCallback(String status,
                               String txnId,
                               String amount,
                               String productInfo,
                               String firstName,
                               String email,
                               String hash,
                               String payuId) {
        handleCallback(status, txnId, amount, productInfo, firstName, email, hash, payuId, null, null);
    }

    public void handleCallback(String status,
                               String txnId,
                               String amount,
                               String productInfo,
                               String firstName,
                               String email,
                               String hash,
                               String payuId,
                               String callbackKey,
                               String additionalCharges) {

        if (txnId == null || txnId.isBlank() ||
                status == null || status.isBlank()) {
            throw new BadRequestException("Invalid callback data");
        }

        // Rejection of altered merchant identifiers (Item 9)
        if (callbackKey != null && !callbackKey.isBlank() && !callbackKey.trim().equalsIgnoreCase(key.trim())) {
            throw new BadRequestException("Invalid merchant key");
        }

        Payment payment = paymentRepository.findByTxnId(txnId)
                .orElseThrow(() -> new BadRequestException("Payment not found"));

        // Rejection of altered amounts (Item 8)
        if (amount != null && !amount.isBlank()) {
            try {
                double parsedAmount = Double.parseDouble(amount.trim());
                if (Math.abs(parsedAmount - payment.getAmount()) > 0.05) {
                    throw new BadRequestException("Altered payment amount detected: callback=" + parsedAmount + " expected=" + payment.getAmount());
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Malformed callback amount");
            }
        }

        // State Machine Integrity (Phase 5):
        // 1. Idempotent duplicate callback delivery
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return;
        }
        // 2. A failed payment cannot be promoted by invalid or subsequent callback
        if (payment.getStatus() == PaymentStatus.FAILED && "success".equalsIgnoreCase(status)) {
            throw new BadRequestException("Cannot promote failed payment to success");
        }

        String normalizedAmount = normalizeAmount(amount, payment.getAmount());
        String normalizedProductInfo = getFirstNonBlank(productInfo, payment.getProductInfo());
        String normalizedFirstName = getFirstNonBlank(firstName, payment.getFirstName());
        String normalizedEmail = getFirstNonBlank(email, payment.getEmail());

        // 1) Validate with callback payload values (including optional additionalCharges)
        boolean isValid = payUHashService.validatePaymentHash(
                status,
                txnId,
                normalizedAmount,
                normalizedProductInfo,
                normalizedFirstName,
                normalizedEmail,
                additionalCharges,
                hash
        );
        // 2) Fallback for minor callback formatting differences in manual tests
        if (!isValid) {
            isValid = payUHashService.validatePaymentHash(
                    status,
                    txnId,
                    String.format("%.2f", payment.getAmount()),
                    payment.getProductInfo(),
                    payment.getFirstName(),
                    payment.getEmail(),
                    additionalCharges,
                    hash
            );
        }

        if (!isValid) {
            throw new BadRequestException("Invalid PayU hash");
        }

        payment.setPayuPaymentId(payuId);

        if ("success".equalsIgnoreCase(status)) {
            payment.setStatus(PaymentStatus.SUCCESS);

            // ✅ ENROLL STUDENT IN COURSE (after confirmed payment)
            try {
                Long courseId = Long.parseLong(payment.getCourseId());
                UUID studentId = UUID.fromString(payment.getPayerUserId());
                enrollmentClient.enrollStudentAfterPayment(courseId, studentId);
            } catch (IllegalArgumentException e) {
                System.err.println("⚠️ Invalid courseId or studentId format for enrollment: " + e.getMessage());
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
    }`;

if (psContent.includes(oldHandleCallback)) {
  psContent = psContent.replace(oldHandleCallback, newHandleCallback);
  // Also fix payuActionUrl
  psContent = psContent.replace(
    '.payuActionUrl(payuBaseUrl + "/_payment")',
    '.payuActionUrl(payuBaseUrl.endsWith("/_payment") ? payuBaseUrl : (payuBaseUrl + "/_payment"))'
  );
  fs.writeFileSync(paymentServiceFile, psContent.replace(/\n/g, '\r\n'), 'utf8');
  console.log('PAYMENT_SERVICE_PATCHED_SUCCESSFULLY');
} else {
  console.log('PAYMENT_SERVICE_OLD_BLOCK_NOT_FOUND');
}

// 2. Patch PaymentController.java
const paymentControllerFile = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/controller/PaymentController.java';
let pcContent = fs.readFileSync(paymentControllerFile, 'utf8').replace(/\r\n/g, '\n');

const oldSuccessForm = `    // 2. POST /payments/callback/success
    @PostMapping(value = "/callback/success", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> successCallback(@RequestParam Map<String, String> params) {
        paymentService.handleCallback(
                params.get("status"),
                params.get("txnid"),
                params.get("amount"),
                params.get("productinfo"),
                params.get("firstname"),
                params.get("email"),
                params.get("hash"),
                params.get("mihpayid")
        );
        return ResponseEntity.ok("Payment Success Handled");
    }

    // JSON testing endpoint for success callback
    @PostMapping(value = "/callback/success", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> successCallbackJson(@RequestBody PaymentCallbackRequest request) {
        paymentService.handleCallback(
                request.getStatus(),
                request.getTxnid(),
                request.getAmount(),
                request.getProductinfo(),
                request.getFirstname(),
                request.getEmail(),
                request.getHash(),
                request.getMihpayid()
        );
        return ResponseEntity.ok("Payment Success Handled");
    }

    // 3. POST /payments/callback/failure
    @PostMapping(value = "/callback/failure", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> failureCallback(@RequestParam Map<String, String> params) {
        paymentService.handleCallback(
                params.get("status"),
                params.get("txnid"),
                params.get("amount"),
                params.get("productinfo"),
                params.get("firstname"),
                params.get("email"),
                params.get("hash"),
                params.get("mihpayid")
        );
        return ResponseEntity.ok("Payment Failure Handled");
    }

    // JSON testing endpoint for failure callback
    @PostMapping(value = "/callback/failure", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> failureCallbackJson(@RequestBody PaymentCallbackRequest request) {
        paymentService.handleCallback(
                request.getStatus(),
                request.getTxnid(),
                request.getAmount(),
                request.getProductinfo(),
                request.getFirstname(),
                request.getEmail(),
                request.getHash(),
                request.getMihpayid()
        );
        return ResponseEntity.ok("Payment Failure Handled");
    }`;

const newSuccessForm = `    // 2. POST /payments/callback/success
    @PostMapping(value = "/callback/success", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> successCallback(@RequestParam Map<String, String> params) {
        paymentService.handleCallback(
                params.get("status"),
                params.get("txnid"),
                params.get("amount"),
                params.get("productinfo"),
                params.get("firstname"),
                params.get("email"),
                params.get("hash"),
                params.get("mihpayid"),
                params.get("key"),
                params.get("additionalCharges")
        );
        return ResponseEntity.ok("Payment Success Handled");
    }

    // JSON testing endpoint for success callback
    @PostMapping(value = "/callback/success", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> successCallbackJson(@RequestBody PaymentCallbackRequest request) {
        paymentService.handleCallback(
                request.getStatus(),
                request.getTxnid(),
                request.getAmount(),
                request.getProductinfo(),
                request.getFirstname(),
                request.getEmail(),
                request.getHash(),
                request.getMihpayid(),
                request.getKey(),
                request.getAdditionalCharges()
        );
        return ResponseEntity.ok("Payment Success Handled");
    }

    // 3. POST /payments/callback/failure
    @PostMapping(value = "/callback/failure", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> failureCallback(@RequestParam Map<String, String> params) {
        paymentService.handleCallback(
                params.get("status"),
                params.get("txnid"),
                params.get("amount"),
                params.get("productinfo"),
                params.get("firstname"),
                params.get("email"),
                params.get("hash"),
                params.get("mihpayid"),
                params.get("key"),
                params.get("additionalCharges")
        );
        return ResponseEntity.ok("Payment Failure Handled");
    }

    // JSON testing endpoint for failure callback
    @PostMapping(value = "/callback/failure", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> failureCallbackJson(@RequestBody PaymentCallbackRequest request) {
        paymentService.handleCallback(
                request.getStatus(),
                request.getTxnid(),
                request.getAmount(),
                request.getProductinfo(),
                request.getFirstname(),
                request.getEmail(),
                request.getHash(),
                request.getMihpayid(),
                request.getKey(),
                request.getAdditionalCharges()
        );
        return ResponseEntity.ok("Payment Failure Handled");
    }`;

if (pcContent.includes(oldSuccessForm)) {
  pcContent = pcContent.replace(oldSuccessForm, newSuccessForm);
  pcContent = pcContent.replace(
    'String actionUrl = escapeHtml(payuBaseUrl + "/_payment");',
    'String actionUrl = escapeHtml(payuBaseUrl.endsWith("/_payment") ? payuBaseUrl : (payuBaseUrl + "/_payment"));'
  );
  fs.writeFileSync(paymentControllerFile, pcContent.replace(/\n/g, '\r\n'), 'utf8');
  console.log('PAYMENT_CONTROLLER_PATCHED_SUCCESSFULLY');
} else {
  console.log('PAYMENT_CONTROLLER_OLD_BLOCK_NOT_FOUND');
}

