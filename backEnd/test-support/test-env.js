// Loaded first by every test file.
//
// Fixes the settings the tested code reads when it is imported, so the tests
// give the same result on every computer, whatever is in your own .env.
// (dotenv never overwrites a value that is already set.)
//
// The Gemini key is fake on purpose: these tests never call Gemini, and a
// fake key guarantees that a mistake cannot spend your real quota.

process.env.GEMINI_API_KEY = "test-key-not-real";
process.env.RAG_CHUNK_CHARS = "1000";
process.env.RAG_CHUNK_OVERLAP = "150";
process.env.RAG_MAX_CHUNKS_PER_DOC = "1000";
process.env.CHAT_MAX_SOURCES = "5";
process.env.AUTH_RATE_LIMIT_PER_15_MIN = "10";
