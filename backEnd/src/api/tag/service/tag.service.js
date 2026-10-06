import { QUESTION_TAGS } from "../../question/constants/question-tags.js";

// Only name and description are public. "examples" is internal matching text.
const getTagsService = async () =>
  QUESTION_TAGS.map(({ name, description }) => ({ name, description }));

export { getTagsService };
