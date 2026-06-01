1. **Improve Performance (Caching & ISR)**
   - Replace `cache: 'no-store'` with `next: { revalidate: 3600 }` (or similar caching strategy) in API fetches within `src/app/blog/page.tsx` and `src/app/blog/[slug]/page.tsx` to enable Incremental Static Regeneration (ISR). This will significantly boost page load speed and TTFB (Time to First Byte).
   - Add page-level `export const revalidate = 3600;` for the single blog post page to ensure ISR caching at the page level.

2. **Enhance SEO**
   - Add OpenGraph and Twitter metadata to `src/app/blog/page.tsx` so social sharing works perfectly and SEO is maximized.
   - Ensure the JSON-LD schema is correctly structured.
   - Ensure image alternative texts (`alt`) are always present and descriptive.

3. **Optimize Image Loading**
   - Ensure `priority` is correctly used for LCP (Largest Contentful Paint) images.
   - Keep Next.js Image formats config as `avif/webp` (already present in `next.config.js`).

4. **Complete Pre-commit Steps**
   - Run tests, check for TypeScript/Lint errors, and run pre-commit instructions to ensure proper testing, verification, review, and reflection are done.

5. **Submit the Code**
   - Commit and submit the branch.
