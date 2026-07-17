import type { Page } from '@domus/content-model';

export function alternatePages(page: Page, pages: Page[]) {
  return pages
    .filter((candidate) => candidate.translationGroup === page.translationGroup && candidate.status === 'published')
    .map((candidate) => ({ language: candidate.language, path: candidate.canonicalPath }));
}

export function absoluteUrl(origin: string, path: string) {
  return new URL(path, origin.endsWith('/') ? origin : `${origin}/`).toString();
}

