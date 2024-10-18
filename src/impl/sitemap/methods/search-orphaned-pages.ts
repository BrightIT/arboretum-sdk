import {
  ArboretumClientT,
  OrphanedArboretumPageT,
} from "../../../arboretum-client";
import { phraseSimilarity } from "../../../utils/phrase-similarity";
import { ArboretumClientCtx } from "../../arboretum-client.impl";
import { CONSTANTS } from "../../constants";
import { orphanedPages } from "./orphaned-pages";

const orphanedPagePhraseSimilarity = (
  page: Pick<OrphanedArboretumPageT, "slug" | "id" | "title">,
  phrase: string
): number => {
  const slugSimilarity = phraseSimilarity(phrase, page.slug);
  const idSimilarity = phraseSimilarity(phrase, page.id);
  const titleSimilarity = page.title ? phraseSimilarity(phrase, page.title) : 0;
  return Math.max(slugSimilarity, idSimilarity, titleSimilarity);
};

export const searchOrphanedPages =
  (
    ctx: Pick<
      ArboretumClientCtx,
      "data" | "sitemap" | "options" | "pageHomeTagId"
    >
  ): ArboretumClientT["searchOrphanedPages"] =>
  (phrase, localeCode, limit) => {
    const pages = orphanedPages(ctx)({ localeCode });

    if (pages._tag === "Right") {
      return pages.right
        .map((page) => {
          const searchScore = orphanedPagePhraseSimilarity(page, phrase);
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
