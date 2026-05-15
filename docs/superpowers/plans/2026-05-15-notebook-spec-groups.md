# Notebook Spec Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add grouped notebook specifications, keep notebook collections functional, and let admins build notebook collections from readable spec choices instead of raw keys.

**Architecture:** Keep product values in `Product.specs` JSON, add first-class category spec groups, and enrich category spec templates with `groupId` plus a collection-eligibility flag. The notebook admin UI becomes the authoring surface for groups/specs/collections, while product and public product views consume the same grouped metadata to render only filled values.

**Tech Stack:** Prisma, PostgreSQL, NestJS, React, TanStack Query, TypeScript.

---

## File map

- Modify `C:\TechMarket\prisma\schema.prisma` — add spec groups and extra template fields.
- Modify `C:\TechMarket\prisma\seed.mjs` — seed notebook groups and map existing notebook specs into them.
- Create `C:\TechMarket\apps\server\src\category-spec-groups\*` — CRUD for category spec groups.
- Modify `C:\TechMarket\apps\server\src\category-specs\*` — group linkage, collection eligibility, grouped reads, deletion safety.
- Modify `C:\TechMarket\apps\server\src\category-collections\*` — validate collection conditions against notebook specs.
- Modify `C:\TechMarket\apps\server\src\app.module.ts` — register the new module.
- Create `C:\TechMarket\apps\client\src\lib\category-spec-groups-api.ts` — client API.
- Modify `C:\TechMarket\apps\client\src\lib\category-specs-api.ts` — expose new fields.
- Modify `C:\TechMarket\apps\client\src\pages\admin\AdminCategoryFormPage.tsx` — groups UI and collection builder.
- Modify `C:\TechMarket\apps\client\src\pages\admin\AdminProductFormPage.tsx` — grouped notebook fields.
- Modify product-detail page files after locating exact owner — grouped public rendering for notebook specs.

## Task 1: Persist notebook spec groups

**Files:**
- Modify: `C:\TechMarket\prisma\schema.prisma`
- Modify: `C:\TechMarket\prisma\seed.mjs`

- [ ] Add model `CategorySpecGroup` with `id`, `categoryId`, `name`, `sortOrder`, timestamps, relation to `Category` and templates.
- [ ] Add `groupId String?`, `isCollectionFilter Boolean @default(false)`, and group relation to `CategorySpecTemplate`.
- [ ] Seed notebook groups in display order.
- [ ] Attach existing notebook template entries to groups and mark `purpose`, `os`, `processorFamily`, `gpuSeries` as collection-eligible.
- [ ] Run Prisma generation/migration command required by the project and confirm the schema applies.

## Task 2: Add backend CRUD for spec groups

**Files:**
- Create: `C:\TechMarket\apps\server\src\category-spec-groups\category-spec-groups.controller.ts`
- Create: `C:\TechMarket\apps\server\src\category-spec-groups\category-spec-groups.module.ts`
- Create: `C:\TechMarket\apps\server\src\category-spec-groups\category-spec-groups.service.ts`
- Create: `C:\TechMarket\apps\server\src\category-spec-groups\dto\create-category-spec-group.dto.ts`
- Create: `C:\TechMarket\apps\server\src\category-spec-groups\dto\update-category-spec-group.dto.ts`
- Modify: `C:\TechMarket\apps\server\src\app.module.ts`

- [ ] Add endpoints under `/categories/:categoryId/spec-groups`.
- [ ] Allow CRUD only for section categories, mirroring existing category-spec rules.
- [ ] Return groups sorted by `sortOrder`, then `name`.
- [ ] Register the module.

## Task 3: Extend category specs for grouping and collection safety

**Files:**
- Modify: `C:\TechMarket\apps\server\src\category-specs\category-specs.service.ts`
- Modify: DTOs in `C:\TechMarket\apps\server\src\category-specs\dto\`
- Modify: `C:\TechMarket\apps\server\src\category-specs\category-specs.service.spec.ts`

- [ ] Accept and validate `groupId` and `isCollectionFilter`.
- [ ] Ensure `groupId`, when present, belongs to the same category.
- [ ] Include group data when listing specs.
- [ ] Block deletion of a spec when an active collection references its key.
- [ ] Add unit tests for group validation and deletion blocking.

## Task 4: Validate collection conditions against notebook specs

**Files:**
- Modify: `C:\TechMarket\apps\server\src\category-collections\category-collections.service.ts`
- Add or modify tests near `C:\TechMarket\apps\server\src\category-collections\`

- [ ] Accept existing condition shape: either `{ brandSlug }` or `{ specs: { [key]: value } }`.
- [ ] For spec-based conditions, require the referenced template to exist in the category and have `isCollectionFilter = true`.
- [ ] For `SELECT` specs, reject values outside allowed options.
- [ ] Preserve current runtime filtering behavior in `ProductsService`.

## Task 5: Add client APIs for groups and richer specs

**Files:**
- Create: `C:\TechMarket\apps\client\src\lib\category-spec-groups-api.ts`
- Modify: `C:\TechMarket\apps\client\src\lib\category-specs-api.ts`

- [ ] Expose group CRUD functions and types.
- [ ] Extend spec types with `groupId`, `group`, and `isCollectionFilter`.

## Task 6: Upgrade notebook category admin

**Files:**
- Modify: `C:\TechMarket\apps\client\src\pages\admin\AdminCategoryFormPage.tsx`

- [ ] Add a groups management block for section categories.
- [ ] Extend spec editor with group selector and “для подборок” checkbox.
- [ ] Show group name in the specs table.
- [ ] Replace raw collection field selector with condition type:
  - `Характеристика`
  - `Бренд`
- [ ] For `Характеристика`, show only `isCollectionFilter` specs.
- [ ] For `SELECT` specs, render value select from options.
- [ ] Keep saved condition payload compatible with current backend format.

## Task 7: Group notebook fields in product admin

**Files:**
- Modify: `C:\TechMarket\apps\client\src\pages\admin\AdminProductFormPage.tsx`

- [ ] Group `visibleSpecs` by `group`.
- [ ] Render grouped sections ordered by group sort order and spec sort order.
- [ ] Keep existing handling for string/number/boolean/select values.
- [ ] Leave non-notebook categories functionally unchanged.

## Task 8: Render grouped notebook specs publicly

**Files:**
- Locate and modify the current public product-detail page and any local helpers/components it uses.

- [ ] Fetch category specs for the product’s section if not already available.
- [ ] Merge spec templates with product values.
- [ ] Filter out empty values.
- [ ] Render grouped rows ordered by group/spec order.
- [ ] Keep `additionalSpecs` as a final fallback block or append them after template-backed specs.

## Task 9: Verify the notebook flow

**Files:**
- No new files required.

- [ ] Create or edit notebook groups and specs.
- [ ] Confirm a notebook can have fewer filled specs than the full template.
- [ ] Confirm grouped public rendering hides empty fields.
- [ ] Confirm current collections still resolve:
  - gaming notebooks
  - Windows 11 notebooks
  - AMD Ryzen notebooks
  - Apple MacBook
- [ ] Confirm collection editor no longer requires raw spec keys.

## Self-review

- Spec coverage: tasks cover data model, admin authoring, product entry, public rendering, and collection safety.
- Placeholder scan: no TODO/TBD placeholders remain.
- Type consistency: uses `groupId`, `isCollectionFilter`, and existing `conditions.specs` payload shape consistently.
