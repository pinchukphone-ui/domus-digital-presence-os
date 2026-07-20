import { describe, expect, it } from 'vitest';
import { rotatePreviewCredentials } from '../../../infrastructure/database/rotate-preview-credentials';

describe('preview credential rotation', () => {
  it('replaces preview secrets without changing unrelated environment values', () => {
    const rotated = rotatePreviewCredentials([
      'POSTGRES_DB=domus',
      'DIRECTUS_PREVIEW_TOKEN=old-token',
      'PREVIEW_AUTH_USER=old-user',
      ''
    ].join('\n'), {
      directusToken: 'new-token',
      authUser: 'preview',
      authPassword: 'new-password'
    });

    expect(rotated).toContain('POSTGRES_DB=domus');
    expect(rotated).toContain('DIRECTUS_PREVIEW_TOKEN=new-token');
    expect(rotated).toContain('PREVIEW_AUTH_USER=preview');
    expect(rotated).toContain('PREVIEW_AUTH_PASSWORD=new-password');
    expect(rotated).not.toContain('old-token');
    expect(rotated).not.toContain('old-user');
  });
});
