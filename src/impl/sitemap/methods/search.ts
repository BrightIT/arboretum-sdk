import {
  ArboretumClientT,
  ArboretumPageT,
  ArboretumRedirectT,
} from "../../../arboretum-client";
import { phraseSimilarity } from "../../../utils/phrase-similarity";
import { ArboretumClientCtx } from "../../arboretum-client.impl";
import { CONSTANTS } from "../../constants";
import { pages } from "./pages";

const pagePhraseSimilarity = (
  page: Pick<ArboretumPageT, "id" | "slug" | "path" | "title">,
  phrase: string
): number => {
  const slugSimilarity = phraseSimilarity(phrase, page.slug);
  const pathSimilarity = phraseSimilarity(phrase, page.path);
  const idSimilarity = phraseSimilarity(phrase, page.id);
  const titleSimilarity = page.title ? phraseSimilarity(phrase, page.title) : 0;
  return Math.max(
    slugSimilarity,
    pathSimilarity,
    idSimilarity,
    titleSimilarity
  );
};

const redirectPhraseSimilarity = (
  redirect: Pick<ArboretumRedirectT, "id" | "path" | "title">,
  phrase: string
): number => {
  const pathSimilarity = phraseSimilarity(phrase, redirect.path);
  const idSimilarity = phraseSimilarity(phrase, redirect.id);
  const titleSimilarity = redirect.title
    ? phraseSimilarity(phrase, redirect.title)
    : 0;
  return Math.max(pathSimilarity, idSimilarity, titleSimilarity);
};

// Primitive implementation that can be inefficient for large sitemaps
export const search =
  (
    ctx: Pick<
      ArboretumClientCtx,
      "data" | "sitemap" | "options" | "pageHomeTagId"
    >
  ): ArboretumClientT["search"] =>
  (phrase, localeCode, limit) => {
    const allPages = pages(ctx)({ localeCode });

    if (allPages._tag === "Right") {
      return allPages.right
        .map((page) => {
          const searchScore =
            page.type === "page"
              ? pagePhraseSimilarity(page, phrase)
              : redirectPhraseSimilarity(page, phrase);
          return { ...page, searchScore };
        })
        .filter(
          ({ searchScore }) => searchScore >= CONSTANTS.search.minSearchScore
        )
        .sort((a, b) => b.searchScore - a.searchScore)
        .slice(0, limit);
    } else {
      return [];
    }
  };
