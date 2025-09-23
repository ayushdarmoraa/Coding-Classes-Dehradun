import { google } from 'googleapis';

async function main() {
  // Auth from GOOGLE_APPLICATION_CREDENTIALS (service account JSON)
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });
  const client = await auth.getClient();
  const webmasters = google.webmasters({ version: 'v3', auth: client });

  const siteUrl = 'sc-domain:dooncodingacademy.in';
  const sitemapUrl = 'https://dooncodingacademy.in/sitemap.xml';

  await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
  console.log('Sitemap submitted (domain property):', sitemapUrl);
}

main().catch((err) => {
  console.error('GSC sitemap submit failed (domain property):', err?.errors || err);
  process.exit(1);
});
