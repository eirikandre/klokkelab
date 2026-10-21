# Statisk side servert av nginx
FROM nginx:1.27-alpine

# Egen serverkonfigurasjon (caching, gzip, SPA-fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Selve appen
COPY index.html om.html personvern.html style.css app.js favicon.svg og-image.png robots.txt sitemap.xml /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://localhost/ || exit 1
