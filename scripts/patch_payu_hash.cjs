const fs = require('fs');

const file = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/service/PayUHashService.java';
let content = fs.readFileSync(file, 'utf8');

const oldMethod = `    public boolean validatePaymentHash(String status,
                                       String txnId,
                                       String amount,
                                       String productInfo,
                                       String firstName,
                                       String email,
                                       String hash) {

        try {
            String calculatedHash = generateCallbackHash(status, txnId, amount, productInfo, firstName, email);
            return calculatedHash.equalsIgnoreCase(getValue(hash).trim());

        } catch (Exception e) {
            return false;
        }
    }

    public String generateCallbackHash(String status,
                                       String txnId,
                                       String amount,
                                       String productInfo,
                                       String firstName,
                                       String email) {
        try {
            String sequence = salt + "|" + getValue(status).trim() +
                    "|||||||||||" +
                    getValue(email).trim() + "|" +
                    getValue(firstName).trim() + "|" +
                    getValue(productInfo).trim() + "|" +
                    getValue(amount).trim() + "|" +
                    getValue(txnId).trim() + "|" + key;
            return hashSHA512(sequence);
        } catch (Exception e) {
            throw new RuntimeException("Callback hash generation failed", e);
        }
    }`;

const newMethod = `    public boolean validatePaymentHash(String status,
                                       String txnId,
                                       String amount,
                                       String productInfo,
                                       String firstName,
                                       String email,
                                       String hash) {
        return validatePaymentHash(status, txnId, amount, productInfo, firstName, email, null, hash);
    }

    public boolean validatePaymentHash(String status,
                                       String txnId,
                                       String amount,
                                       String productInfo,
                                       String firstName,
                                       String email,
                                       String additionalCharges,
                                       String hash) {
        try {
            if (hash == null || hash.isBlank()) {
                return false;
            }
            String targetHash = hash.trim();

            if (additionalCharges != null && !additionalCharges.isBlank()) {
                String hashWithCharges = generateCallbackHash(status, txnId, amount, productInfo, firstName, email, additionalCharges);
                if (hashWithCharges.equalsIgnoreCase(targetHash)) {
                    return true;
                }
            }

            String standardHash = generateCallbackHash(status, txnId, amount, productInfo, firstName, email, null);
            return standardHash.equalsIgnoreCase(targetHash);
        } catch (Exception e) {
            return false;
        }
    }

    public String generateCallbackHash(String status,
                                       String txnId,
                                       String amount,
                                       String productInfo,
                                       String firstName,
                                       String email) {
        return generateCallbackHash(status, txnId, amount, productInfo, firstName, email, null);
    }

    public String generateCallbackHash(String status,
                                       String txnId,
                                       String amount,
                                       String productInfo,
                                       String firstName,
                                       String email,
                                       String additionalCharges) {
        try {
            StringBuilder sb = new StringBuilder();
            if (additionalCharges != null && !additionalCharges.isBlank()) {
                sb.append(additionalCharges.trim()).append("|");
            }
            sb.append(salt).append("|")
              .append(getValue(status).trim())
              .append("|||||||||||")
              .append(getValue(email).trim()).append("|")
              .append(getValue(firstName).trim()).append("|")
              .append(getValue(productInfo).trim()).append("|")
              .append(getValue(amount).trim()).append("|")
              .append(getValue(txnId).trim()).append("|")
              .append(key);

            return hashSHA512(sb.toString());
        } catch (Exception e) {
            throw new RuntimeException("Callback hash generation failed", e);
        }
    }`;

// Normalize line endings
content = content.replace(/\r\n/g, '\n');
const normalizedOld = oldMethod.replace(/\r\n/g, '\n');
const normalizedNew = newMethod.replace(/\r\n/g, '\n');

if (content.includes(normalizedOld)) {
  content = content.replace(normalizedOld, normalizedNew);
  // Revert to CRLF
  fs.writeFileSync(file, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('PAYU_HASH_SERVICE_PATCHED_SUCCESSFULLY');
} else {
  console.log('OLD_METHOD_NOT_FOUND');
}

