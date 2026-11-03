const fs = require('fs');
const path = require('path');

const p = path.resolve('src/api/wishlistApi.js');
let content = fs.readFileSync(p, 'utf8');

const oldAdd = `      const response = await axiosInstance.post('/api/v1/wishlist', payload);
      return response.data;
    } catch (err) {
      console.warn('[wishlistApi] POST /api/v1/wishlist failed', err);
      throw err;
    }`;

const newAdd = `      const response = await axiosInstance.post('/api/v1/wishlist', payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 409) {
        // Course is already in wishlist - treat as idempotent success
        return { success: true, status: 'SUCCESS', alreadyExists: true, message: 'Course is already in your wishlist', data: err.response.data?.data || null };
      }
      console.warn('[wishlistApi] POST /api/v1/wishlist failed', err);
      throw err;
    }`;

const oldRemove = `      const response = await axiosInstance.delete(\`/api/v1/wishlist/\${courseId}\`);
      return response.data;
    } catch (err) {
      console.warn(\`[wishlistApi] DELETE /api/v1/wishlist/\${courseId} failed\`);
      throw err;
    }`;

const newRemove = `      const response = await axiosInstance.delete(\`/api/v1/wishlist/\${courseId}\`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Course already removed or not found - treat as idempotent success
        return { success: true, status: 'SUCCESS', notFound: true, message: 'Item not in wishlist', data: null };
      }
      console.warn(\`[wishlistApi] DELETE /api/v1/wishlist/\${courseId} failed\`);
      throw err;
    }`;

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

content = replaceNorm(content, oldAdd, newAdd);
content = replaceNorm(content, oldRemove, newRemove);
fs.writeFileSync(p, content, 'utf8');
console.log('✅ wishlistApi.js patched successfully');

