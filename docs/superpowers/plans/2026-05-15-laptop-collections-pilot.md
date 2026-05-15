# Laptop Collections Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fake notebook subcategories with condition-based laptop collections, add a fixed notebook template, and seed a few real notebook products.

**Architecture:** Keep `Category` for real product buckets and introduce category-scoped `Collection` records whose JSON conditions are evaluated against product `specs`/brand. Products stay in the `notebooks` category, while menu links and admin selection derive from collection rules rather than duplicate categories.

**Tech Stack:** NestJS, Prisma, React, React Query, TypeScript.

---

### Task 1: Data model and API
- [ ] Add Prisma models/migration for category collections and product collection helpers.
- [ ] Add backend service/controller for reading and managing collections.
- [ ] Extend product querying so a collection slug filters products by stored conditions.

### Task 2: Admin workflow
- [ ] Add frontend API types for collections.
- [ ] In category edit page, show collection management for sections.
- [ ] In product form, show notebook template fields and selectable condition values used by collections.

### Task 3: Pilot seed
- [ ] Keep `notebooks` as the real category.
- [ ] Replace fake notebook leaves with collections: gaming, business, home, MacBook, Windows 11, GeForce RTX, AMD Ryzen, Intel Core, Chromebooks.
- [ ] Seed a small set of real notebook products without images and delete the old fake notebook products.

### Task 4: Verification
- [ ] Add targeted tests for collection filtering and notebook template validation.
- [ ] Run only focused tests/build checks needed for the pilot.
