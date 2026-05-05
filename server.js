// Tiny redirect service for theparascandagency.business -> theparascandagency.biz/request-call-back
//
// Default behavior: every incoming request (any path, any query) gets a 301
// redirect to the single destination page below.
//
// If you instead want to PRESERVE the path (e.g. /foo -> /request-call-back/foo),
// flip PRESERVE_PATH to true.

const http = require('http');
const { URL } = require('url');

const TARGET = process.env.REDIRECT_TARGET || 'https://link.agentsuite.ai/widget/form/KGl7PsbISFEtJQQGirls?notrack=true';
const PRESERVE_PATH = (process.env.PRESERVE_PATH || 'false').toLowerCase() === 'true';
const STATUS = parseInt(process.env.REDIRECT_STATUS || '301', 10); // 301 permanent, 302 temporary
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  let location = TARGET;

  if (PRESERVE_PATH) {
    // Append the incoming path + query to the target base
    const targetUrl = new URL(TARGET);
    const incoming = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    // Join target path with incoming path, avoiding double slashes
    const basePath = targetUrl.pathname.replace(/\/$/, '');
    const extraPath = incoming.pathname === '/' ? '' : incoming.pathname;
    targetUrl.pathname = basePath + extraPath;
    targetUrl.search = incoming.search;
    location = targetUrl.toString();
  }

  res.writeHead(STATUS, {
    Location: location,
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end(`Redirecting to ${location}\n`);
});

server.listen(PORT, () => {
  console.log(
    `Redirect server listening on :${PORT} -> ${TARGET} ` +
    `(status=${STATUS}, preservePath=${PRESERVE_PATH})`
  );
});
