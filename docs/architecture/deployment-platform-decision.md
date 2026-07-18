# Deployment platform decision

## Status

Accepted for the stage-1 pilot. External provisioning is deferred.

## Decision

Use one Hetzner Cloud shared-x86 VPS in `nbg1` for the first production slice.
Run the existing Docker Compose workloads behind Caddy and publish immutable
Astro images from GHCR. Keep preview and production isolated by Unix user,
Compose project, port, runtime environment and SSH key.

Recommended starting capacity: 2 vCPU, 4 GB RAM, server backups enabled and an
off-host encrypted PostgreSQL/uploads backup. Firewall exposes only 80/443 and
restricted SSH; PostgreSQL and Directus internal ports are not public.

## Rationale

- It directly reuses the verified Docker/PostgreSQL/Directus/Astro contour.
- It provides EU hosting and a short network path to the Polish pilot audience.
- A single low-traffic vertical slice does not justify Kubernetes or separate
  managed services yet.
- Render was considered, but full multi-service preview environments require a
  paid workspace tier and duplicate billable resources. Vercel alone does not
  host the required persistent Directus/PostgreSQL contour.

## Safety gates

- `main` requires a PR, one approval, current `validate`, and resolved threads.
- GitHub `production` requires an explicit environment approval.
- Repository variable `DEPLOYMENT_ENABLED` remains `false` until infrastructure,
  domains, backup, preview authentication and live verification are ready.
- Environment-scoped SSH keys are separate. Host fingerprints are added only
  after the VPS exists and its fingerprint has been independently verified.
- Production deploys use a GHCR image digest, not a mutable tag.

## Deferred decisions

- Separate production database/host or managed PostgreSQL.
- High availability, load balancing and automatic failover.
- Object storage for Directus assets and automated off-host retention policy.
- Final domains, DNS provider, monitoring and alert routing.

These are stage-2 decisions and must be based on traffic, recovery objectives
and operational ownership observed during the pilot.
