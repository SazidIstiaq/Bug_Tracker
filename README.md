# Bug Tracker (Vercel)

Static frontend (`public/`) + two serverless functions (`api/`).
Storage: Upstash Redis (bug list) + Vercel Blob (attachments).

## Deploy
1. Push this folder to GitHub, then Vercel > Add New > Project > import it.
   (Or run `npx vercel` in this folder.)
2. Project > Storage tab:
   - Create / connect **Upstash Redis** (Marketplace)
   - Create / connect **Blob**
   These add the needed env vars automatically.
3. (Recommended) Settings > Environment Variables > add `TEAM_PASSWORD`.
   Anyone can VIEW bugs; only people with the password can create/update.
4. Redeploy.
