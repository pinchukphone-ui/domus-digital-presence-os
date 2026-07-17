import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';

const workspaceRoot = process.cwd();
const runningServers: ChildProcess[] = [];

function startProcess(command: string, args: string[], environment: NodeJS.ProcessEnv = {}) {
  return spawn(command, args, {
    cwd: workspaceRoot,
    env: { ...process.env, ...environment },
    stdio: 'inherit'
  });
}

async function requireSuccessfulExit(processToWaitFor: ChildProcess, label: string) {
  const [exitCode, signal] = await once(processToWaitFor, 'exit');

  if (exitCode !== 0) {
    throw new Error(`${label} failed (exit code: ${String(exitCode)}, signal: ${String(signal)})`);
  }
}

async function waitUntilHealthy(url: string, server: ChildProcess) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before becoming healthy: ${url}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function stopServers() {
  for (const server of runningServers) {
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGTERM');
  }
}

process.once('SIGINT', stopServers);
process.once('SIGTERM', stopServers);
process.once('exit', stopServers);

try {
  const build = startProcess('pnpm', ['--filter', '@domus/public-web', 'build'], {
    CONTENT_SOURCE: 'fixture',
    PREVIEW_MODE: 'false',
    PUBLIC_SITE_URL: 'http://127.0.0.1:4321'
  });
  await requireSuccessfulExit(build, 'Astro build');

  // Start preview first so the public health check cannot release Playwright
  // until both runtime instances are ready.
  const preview = startProcess('node', ['apps/public-web/dist/server/entry.mjs'], {
    HOST: '127.0.0.1',
    PORT: '4322',
    CONTENT_SOURCE: 'fixture',
    PREVIEW_MODE: 'true',
    PREVIEW_SITE_URL: 'http://127.0.0.1:4322'
  });
  runningServers.push(preview);
  await waitUntilHealthy('http://127.0.0.1:4322/healthz', preview);

  const publicWeb = startProcess('node', ['apps/public-web/dist/server/entry.mjs'], {
    HOST: '127.0.0.1',
    PORT: '4321',
    CONTENT_SOURCE: 'fixture',
    PREVIEW_MODE: 'false',
    PUBLIC_SITE_URL: 'http://127.0.0.1:4321'
  });
  runningServers.push(publicWeb);

  await Promise.race(runningServers.map((server) => once(server, 'exit')));
  throw new Error('An E2E web server exited unexpectedly');
} finally {
  stopServers();
}
