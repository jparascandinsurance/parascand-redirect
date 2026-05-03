# Domain redirect: theparascandagency.business -> theparascandagency.biz/request-call-back

A tiny Node.js service that 301-redirects every incoming request to
`https://theparascandagency.biz/request-call-back`. Designed to be deployed on Railway
and pointed to by the `theparascandagency.business` domain.

## Files

- `server.js` - the redirect handler (no dependencies, plain Node `http`)
- `package.json` - declares the start script so Railway/Nixpacks can boot it
- `railway.json` - tells Railway to build with Nixpacks and run `node server.js`
- `.gitignore`

## Configuration (env vars)

All optional - defaults are already set.

| Variable | Default | Purpose |
|---|---|---|
| `REDIRECT_TARGET` | `https://theparascandagency.biz/request-call-back` | Where to send visitors |
| `REDIRECT_STATUS` | `301` | Use `302` for a temporary redirect |
| `PRESERVE_PATH`   | `false` | If `true`, appends the incoming path/query to the target |
| `PORT` | `3000` | Railway sets this automatically; do not override |

## Local test

```bash
node server.js
# in another terminal:
curl -I http://localhost:3000/anything
# expect: HTTP/1.1 301 Moved Permanently
#         Location: https://theparascandagency.biz/request-call-back
```

## Deploy to Railway

### Option A - via the Railway dashboard (easiest)

1. Push these files to a GitHub repo (e.g. `parascand-redirect`).
2. In Railway, click **New Project** -> **Deploy from GitHub repo** and pick that repo.
3. Railway will auto-detect Node, run `npm install`, and start with `node server.js`.
4. Once the deploy is green, open the service -> **Settings** -> **Networking** ->
   **Generate Domain** so you have a working `*.up.railway.app` URL to test against.
5. Hit that URL in a browser - it should immediately bounce to the request-call-back page.

### Option B - via the Railway CLI

```bash
npm i -g @railway/cli
railway login
railway init           # create a new project
railway up             # deploys the current directory
railway domain         # generates a *.up.railway.app URL for testing
```

## Point theparascandagency.business at the service

1. In Railway, open the service -> **Settings** -> **Networking** ->
   **Custom Domain** -> add `theparascandagency.business`
   (and, if you want the www variant to redirect too, also add `www.theparascandagency.business`).
2. Railway will show you the DNS records you need to create. Typically:
   - **Apex (`theparascandagency.business`):** an `ALIAS`/`ANAME` (or A record set) that
     Railway gives you. Some registrars only support `A` records on the apex - Railway
     will list the IP(s) to use in that case.
   - **www subdomain:** a `CNAME` pointing to the Railway-provided host
     (something like `your-service.up.railway.app`).
3. Log in to whoever runs DNS for `theparascandagency.business` (your registrar -
   GoDaddy, Namecheap, Cloudflare, etc.) and create the records exactly as Railway lists them.
4. Wait for DNS to propagate (usually a few minutes; can be up to a few hours).
   Railway will issue an SSL cert automatically once it sees the domain pointed at it -
   the **Custom Domain** row in the dashboard will turn green.
5. Visit `https://theparascandagency.business` - it should 301 to
   `https://theparascandagency.biz/request-call-back`.

## Verifying the redirect after DNS cuts over

```bash
curl -I https://theparascandagency.business/
# HTTP/2 301
# location: https://theparascandagency.biz/request-call-back
```

## Switching to path-preserving mode later

If you'd rather have `theparascandagency.business/foo?x=1` go to
`theparascandagency.biz/request-call-back/foo?x=1`, set the env var in Railway:

- **Variables** -> `PRESERVE_PATH = true` -> redeploy.
