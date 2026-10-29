# ==============================================================================
# CyberLearnIX / FD_LMS Enterprise Production Container Image
# Fast Hardened Nginx 1.27 Alpine Runtime with Pre-compiled Static Assets
# ==============================================================================

FROM nginx:1.27-alpine-slim AS runner

# Remove default boilerplate configuration
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy hardened reverse-proxy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy production compiled assets
COPY dist /usr/share/nginx/html

# Adjust file ownership and permissions for non-root execution
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html

USER nginx

# Container runtime metadata
EXPOSE 80

# Production Health Check Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/healthz || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]
