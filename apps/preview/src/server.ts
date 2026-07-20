import { timingSafeEqual } from 'node:crypto';
import { createServer, request as createUpstreamRequest, type IncomingHttpHeaders, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

const robotsPolicy = 'noindex, nofollow, noarchive';
const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

type GatewayOptions = {
  upstreamUrl: string;
  username: string;
  password: string;
};

export function createPreviewGateway(options: GatewayOptions): Server {
  if (!options.username || !options.password) throw new Error('Preview auth credentials must not be empty');
  const upstream = new URL(options.upstreamUrl);
  if (upstream.protocol !== 'http:') throw new Error('PREVIEW_UPSTREAM_URL must use http');

  return createServer((request, response) => {
    response.setHeader('X-Robots-Tag', robotsPolicy);
    const requestPath = request.url ?? '/';
    const incomingUrl = new URL(requestPath, 'http://preview.local');
    const isHealthRequest = incomingUrl.origin === 'http://preview.local' && incomingUrl.pathname === '/healthz';

    if (!isHealthRequest && !isAuthorized(request.headers.authorization, options)) {
      response.statusCode = 401;
      response.setHeader('WWW-Authenticate', 'Basic realm="DOMUS Preview", charset="UTF-8"');
      response.setHeader('Cache-Control', 'no-store');
      response.end('Preview authentication required');
      return;
    }

    const target = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, upstream);
    const headers = forwardRequestHeaders(request.headers, target, request.socket.remoteAddress);
    const upstreamRequest = createUpstreamRequest(target, { method: request.method, headers }, (upstreamResponse) => {
      response.statusCode = upstreamResponse.statusCode ?? 502;
      copyResponseHeaders(upstreamResponse.headers, response);
      response.setHeader('X-Robots-Tag', robotsPolicy);
      upstreamResponse.pipe(response);
    });

    upstreamRequest.on('error', () => {
      if (response.headersSent) return response.destroy();
      response.statusCode = 502;
      response.setHeader('Cache-Control', 'no-store');
      response.end('Preview upstream unavailable');
    });
    request.pipe(upstreamRequest);
  });
}

function isAuthorized(header: string | undefined, options: Pick<GatewayOptions, 'username' | 'password'>) {
  if (!header?.startsWith('Basic ')) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
  } catch {
    return false;
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  return secureEqual(decoded.slice(0, separator), options.username) && secureEqual(decoded.slice(separator + 1), options.password);
}

function secureEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function forwardRequestHeaders(headers: IncomingHttpHeaders, target: URL, remoteAddress: string | undefined) {
  const forwarded: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || hopByHopHeaders.has(name) || name === 'authorization' || name === 'host') continue;
    forwarded[name] = value;
  }
  forwarded.host = target.host;
  if (headers.host) forwarded['x-forwarded-host'] = headers.host;
  forwarded['x-forwarded-proto'] = 'http';
  if (remoteAddress) forwarded['x-forwarded-for'] = remoteAddress;
  return forwarded;
}

function copyResponseHeaders(headers: IncomingHttpHeaders, response: ServerResponse) {
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || hopByHopHeaders.has(name) || name === 'x-robots-tag') continue;
    response.setHeader(name, value);
  }
}

function requireEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createPreviewGateway({
    upstreamUrl: requireEnvironment('PREVIEW_UPSTREAM_URL'),
    username: requireEnvironment('PREVIEW_AUTH_USER'),
    password: requireEnvironment('PREVIEW_AUTH_PASSWORD')
  });
  const port = Number(process.env.PORT ?? '4322');
  const host = process.env.HOST ?? '0.0.0.0';
  server.listen(port, host, () => console.log(`Preview gateway listening on ${host}:${port}`));

  const close = () => server.close(() => process.exit(0));
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

export { robotsPolicy };
