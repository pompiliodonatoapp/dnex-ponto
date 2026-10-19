import { z } from "zod";

export const SOLUTION_MANIFEST_VERSION = "1.0" as const;

const pathSchema = z.string()
  .min(1)
  .max(240)
  .regex(/^\/(?!\/)[a-z0-9/_-]*$/i, "Path must be a relative absolute path without query, hash or host.");

const moduleSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9._-]{1,63}$/),
  label: z.string().trim().min(1).max(80),
  path: pathSchema,
  requiredEntitlement: z.string().regex(/^[a-z][a-z0-9._-]{1,127}$/),
  mobilePriority: z.number().int().min(0).max(100),
});

export const solutionManifestSchema = z.object({
  contractVersion: z.literal(SOLUTION_MANIFEST_VERSION),
  productKey: z.string().regex(/^[a-z][a-z0-9_-]{1,63}$/),
  displayName: z.string().trim().min(1).max(80),
  navigationGroup: z.enum(["pessoas", "comercial", "operacoes", "gestao", "fiscal_tributario"]),
  launchPath: pathSchema,
  modules: z.array(moduleSchema).min(1).max(64),
}).superRefine((value, context) => {
  const keys = new Set<string>();
  const paths = new Set<string>();
  for (const [index, item] of value.modules.entries()) {
    if (keys.has(item.key)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "key"], message: "Module keys must be unique." });
    if (paths.has(item.path)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["modules", index, "path"], message: "Module paths must be unique." });
    keys.add(item.key);
    paths.add(item.path);
  }
});

export type SolutionManifest = z.infer<typeof solutionManifestSchema>;

/** Parse a trusted control-plane response before a UI consumes it. */
export function parseSolutionManifest(input: unknown): SolutionManifest {
  return solutionManifestSchema.parse(input);
}
