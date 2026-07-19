import { z } from 'zod';

export const LanguageSchema = z.enum(['pl', 'ru']);
export const StatusSchema = z.enum(['draft', 'published', 'archived']);
export const BlockKindSchema = z.enum(['hero', 'rich_text', 'service', 'calculator', 'cta']);

export const ContentBlockSchema = z.object({
  id: z.string(),
  kind: BlockKindSchema,
  sort: z.number().int(),
  heading: z.string().nullable().default(null),
  body: z.string().nullable().default(null),
  data: z.record(z.unknown()).default({})
});

export const LanguageVersionSnapshotSchema = z.object({
  schema_version: z.literal(1),
  page: z.object({
    id: z.string(),
    hub_id: z.string(),
    translation_group: z.string().uuid(),
    language: LanguageSchema,
    slug: z.string(),
    canonical_path: z.string().startsWith('/'),
    page_type: z.enum(['hub', 'article', 'service']),
    status: StatusSchema,
    title: z.string().min(1),
    meta_description: z.string().min(50).max(170)
  }),
  blocks: z.array(z.object({
    id: z.string(),
    kind: BlockKindSchema,
    sort: z.number().int(),
    heading: z.string().nullable(),
    body: z.string().nullable(),
    data: z.record(z.unknown())
  })).min(1)
});

export const LinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  relation: z.enum(['child', 'related', 'service']).default('related')
});

export const CtaSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  style: z.enum(['primary', 'secondary']).default('primary')
});

export const PageSchema = z.object({
  id: z.string(),
  hubId: z.string(),
  translationGroup: z.string().uuid(),
  language: LanguageSchema,
  slug: z.string(),
  status: StatusSchema,
  title: z.string().min(1),
  metaDescription: z.string().min(50).max(170),
  canonicalPath: z.string().startsWith('/'),
  pageType: z.enum(['hub', 'article', 'service']),
  contentVersion: z.number().int().positive().optional(),
  previewCandidate: z.boolean().optional(),
  breadcrumbs: z.array(z.object({ label: z.string(), href: z.string() })),
  blocks: z.array(ContentBlockSchema).min(1),
  links: z.array(LinkSchema).default([]),
  cta: CtaSchema.nullable().default(null)
});

export const HubSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  pages: z.array(PageSchema)
});

export const DirectusContentChangeManifestSchema = z.object({
  schema_version: z.literal(1),
  task_id: z.string().uuid(),
  title: z.string().min(1),
  scope: z.string().min(1),
  target_page_id: z.string().min(1),
  base_version: z.number().int().positive(),
  snapshot_source_version: z.number().int().positive(),
  candidate_version: z.number().int().positive(),
  candidate_status: z.literal('draft'),
  workflow_status: z.enum(['in_review', 'rolled_back']),
  preview_url: z.string().url(),
  public_url: z.string().url(),
  rollback_reference: z.string().min(1),
  change: z.object({
    block_id: z.string().min(1),
    field: z.literal('body'),
    from: z.string().min(1),
    to: z.string().min(1)
  }),
  verification: z.object({
    public_body: z.string().min(1),
    preview_body: z.string().min(1)
  }),
  external_deployment: z.literal(false)
}).superRefine((manifest, context) => {
  if (manifest.candidate_version <= manifest.base_version) {
    context.addIssue({ code: 'custom', path: ['candidate_version'], message: 'candidate_version must be newer than base_version' });
  }
  if (manifest.snapshot_source_version > manifest.candidate_version) {
    context.addIssue({ code: 'custom', path: ['snapshot_source_version'], message: 'snapshot source cannot be newer than candidate' });
  }
});

export type Language = z.infer<typeof LanguageSchema>;
export type LanguageVersionSnapshot = z.infer<typeof LanguageVersionSnapshotSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Hub = z.infer<typeof HubSchema>;
export type DirectusContentChangeManifest = z.infer<typeof DirectusContentChangeManifestSchema>;
