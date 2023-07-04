import { Either, left, right } from "../../utils/fp-utils";
import { ArboretumClientCtx, LocaleCodeT } from "../arboretum-client.impl";
import { LocaleT } from "../../clients/contentful-client/contentful-client";
import { arrayToMap } from "../../utils/array-to-map";

export type LocalesT = {
  locales: Map<LocaleCodeT, LocaleT>;
  defaultLocaleCode: string;
};

type LocalesR = Either<string, LocalesT>;

export const locales = async (
  ctx: Pick<ArboretumClientCtx, "clientApi" | "options">
): Promise<LocalesR> => {
  const locales = await ctx.clientApi.getLocales();
  const defaultLocaleCode = locales.items.find((i) => i.default)?.code;

  if (!defaultLocaleCode) {
    return left(`Fatal error! Couldn't find contentful default locale`);
  } else {
    return right({
      locales: arrayToMap<LocaleT>((locale) => locale.code)((_) => _)(
        locales.items
      ),
      defaultLocaleCode,
    });
  }
};
