import { createServer, request, type Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createPreviewGateway, robotsPolicy } from '../src/server';

const runningServers: Server[] = [];

afterEach(async () => {
  await Promise.all(runningServers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe('preview gateway', () => {
  it('rejects unauthenticated content without contacting the renderer', async () => {
    let upstreamRequests = 0;
    const upstream = await listen(createServer((_request, response) => {
      upstreamRequests += 1;
      response.end('draft');
    }));
    const gateway = await createGateway(upstream);

    const response = await fetch(`${gateway}/ru/ipoteka`);
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain('Basic realm="DOMUS Preview"');
    expect(response.headers.get('x-robots-tag')).toBe(robotsPolicy);
    expect(upstreamRequests).toBe(0);
  });

  it('forwards authenticated content without leaking credentials and overrides robots headers', async () => {
    let upstreamAuthorization: string | undefined;
    const upstream = await listen(createServer((request, response) => {
      upstreamAuthorization = request.headers.authorization;
      response.setHeader('X-Robots-Tag', 'index');
      response.end('preview draft');
    }));
    const gateway = await createGateway(upstream);

    const response = await fetch(`${gateway}/ru/ipoteka`, {
      headers: { Authorization: `Basic ${Buffer.from('preview:secret').toString('base64')}` }
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('preview draft');
    expect(response.headers.get('x-robots-tag')).toBe(robotsPolicy);
    expect(upstreamAuthorization).toBeUndefined();
  });

  it('keeps the noindex header on unauthenticated health and redirect responses', async () => {
    const upstream = await listen(createServer((request, response) => {
      if (request.url === '/healthz') return response.end('ok');
      response.statusCode = 302;
      response.setHeader('Location', '/404');
      response.end();
    }));
    const gateway = await createGateway(upstream);

    const health = await fetch(`${gateway}/healthz`);
    expect(health.status).toBe(200);
    expect(health.headers.get('x-robots-tag')).toBe(robotsPolicy);
    const redirect = await fetch(`${gateway}/sitemap.xml`, {
      headers: { Authorization: `Basic ${Buffer.from('preview:secret').toString('base64')}` },
      redirect: 'manual'
    });
    expect(redirect.status).toBe(302);
    expect(redirect.headers.get('x-robots-tag')).toBe(robotsPolicy);
  });

  it('never treats an absolute-form request target as a different upstream', async () => {
    let upstreamPath: string | undefined;
    const upstream = await listen(createServer((request, response) => {
      upstreamPath = request.url;
      response.end('safe upstream');
    }));
    const gateway = await createGateway(upstream);
    const gatewayUrl = new URL(gateway);

    const status = await new Promise<number | undefined>((resolve, reject) => {
      const gatewayRequest = request({
        hostname: gatewayUrl.hostname,
        port: gatewayUrl.port,
        path: 'http://untrusted.example/escape?draft=1',
        headers: { Authorization: `Basic ${Buffer.from('preview:secret').toString('base64')}` }
      }, (response) => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      });
      gatewayRequest.on('error', reject);
      gatewayRequest.end();
    });

    expect(status).toBe(200);
    expect(upstreamPath).toBe('/escape?draft=1');
  });
});

async function createGateway(upstreamUrl: string) {
  return listen(createPreviewGateway({ upstreamUrl, username: 'preview', password: 'secret' }));
}

async function listen(server: Server) {
  runningServers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Server did not bind to a TCP port');
  return `http://127.0.0.1:${address.port}`;
}
