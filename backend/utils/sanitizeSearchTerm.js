// Model classes (Template/Blog/User) translate Mongo-style { $regex } queries into
// raw PostgREST filter strings (e.g. `title.ilike.%term%,description.ilike.%term%`
// joined into a single `.or()` call). Commas and parentheses are syntactically
// significant in that DSL, so unescaped user search input can break out of the
// intended filter and inject additional conditions. Strip them before use.
function sanitizeSearchTerm(term) {
  if (typeof term !== 'string') return '';
  return term.replace(/[,()]/g, ' ').trim();
}

module.exports = { sanitizeSearchTerm };
