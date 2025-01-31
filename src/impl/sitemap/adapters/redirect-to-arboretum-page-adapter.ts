import { ArboretumAliasT, ArboretumRedirectT } from "../../../arboretum-client";
import { RedirectT } from "../../arboretum-client.impl";

export const redirectToArboretumPage =
  (localeCode: string) =>
  (redirect: RedirectT): ArboretumRedirectT | ArboretumAliasT => ({
    type: redirect.type,
    id: redirect.sys.id,
    contentTypeId: redirect.sys.contentTypeId,
    localeCode,
    pageId: redirect.page.sys.id,
    path: redirect.path,
    cmaOnlyStatus: redirect.sys.cmaOnlyStatus,
    title: redirect.title,
    metadata: redirect.metadata,
  });
