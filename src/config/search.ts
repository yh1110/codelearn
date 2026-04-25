// Single-character queries explode the ILIKE cost and match nearly everything,
// so require at least 2 characters before hitting the repository.
export const MIN_QUERY_LENGTH = 2;

// Hard cap on rows returned per search type. Keep small to limit DB cost and
// payload size; pagination is not implemented yet.
export const SEARCH_LIMIT = 20;
