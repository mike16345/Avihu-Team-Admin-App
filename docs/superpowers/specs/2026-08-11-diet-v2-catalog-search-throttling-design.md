# Diet V2 Catalog Search Throttling

## Goal

Reduce redundant catalog search requests during a typing burst without making quick-add feel slow.

## Behavior

- Keep popular catalog items available immediately without requiring search text.
- Start remote search only after the normalized query contains at least two characters.
- Use a 300 ms trailing debounce, so typing continuously does not send intermediate searches.
- Cancel an obsolete in-flight request when its query becomes inactive because the user continued typing, changed category, cleared the field, or unmounted the input.
- Keep Enter and the Add button immediate for manually typed food names; they do not wait for remote search.
- Retain React Query caching for repeated category/query combinations.

## Data Flow

`CatalogQuickAdd` owns the raw input, debounces it for 300 ms, and passes the settled value to the catalog search query. The query remains disabled below two characters. React Query supplies an `AbortSignal` to the query function, the catalog API passes it through the shared GET wrapper, and Axios aborts obsolete requests.

## Error Handling

Cancelled searches are normal control flow and must not surface an error to the trainer. Genuine request failures continue to use the existing query error behavior. Popular suggestions remain visible whenever the raw search field is empty.

## Verification

- An automated browser test types a multi-character term faster than the debounce window and asserts that only the final normalized term reaches `/menuItems/v2/search`.
- The test verifies that one-character input sends no search.
- Existing quick-add, manual-add, template, and Server-integration tests remain green.
