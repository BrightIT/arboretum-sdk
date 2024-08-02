import {
  LocalizedSitemapT,
  PageT,
  RedirectT,
} from "../../../arboretum-client.impl";

const mockedRootSysId = "root";
const mockedPage1SysId = "page1";
const mockedPage1_1SysId = "page1-1";
const mockedPage1_1_1SysId = "page1-1-1";
const mockedPage1_1_2SysId = "page1-1-2";
const mockedPage1_2SysId = "page1-2";
const mockedPage2SysId = "page2";
const mockedPage2_1SysId = "page2_1";
const mockedPage3SysId = "page3";

const mockedRedirect1SysId = "redirect1";
const mockedRedirect2SysId = "redirect2";
const mockedRedirect3SysId = "redirect3";

const contentTypeId = "page";

export const mockedRoot: PageT = {
  type: "page",
  sys: { id: mockedRootSysId, contentTypeId },
  parent: undefined,
  slug: mockedRootSysId,
  path: "/en",
  childPages: [
    { sys: { id: mockedPage1SysId } },
    { sys: { id: mockedPage2SysId } },
    { sys: { id: mockedPage3SysId } },
    { sys: { id: mockedRedirect1SysId } },
    { sys: { id: mockedRedirect2SysId } },
    { sys: { id: mockedRedirect3SysId } },
  ],
};

export const mockedPage1: PageT = {
  type: "page",
  sys: { id: mockedPage1SysId, contentTypeId },
  parent: { sys: { id: mockedRoot.sys.id } },
  slug: mockedPage1SysId,
  path: mockedRoot.path + "/" + mockedPage1SysId,
  childPages: [
    { sys: { id: mockedPage1_1SysId } },
    { sys: { id: mockedPage1_2SysId } },
  ],
};

export const mockedPage1_1: PageT = {
  type: "page",
  sys: { id: mockedPage1_1SysId, contentTypeId },
  parent: { sys: { id: mockedPage1.sys.id } },
  path: mockedPage1.path + "/" + mockedPage1_1SysId,
  slug: mockedPage1_1SysId,
  childPages: [
    { sys: { id: mockedPage1_1_1SysId } },
    { sys: { id: mockedPage1_1_2SysId } },
  ],
};

export const mockedPage1_2: PageT = {
  type: "page",
  sys: { id: mockedPage1_2SysId, contentTypeId },
  parent: { sys: { id: mockedPage1.sys.id } },
  path: mockedPage1.path + "/" + mockedPage1_2SysId,
  slug: mockedPage1_2SysId,
  childPages: [],
};

export const mockedPage1_1_1: PageT = {
  type: "page",
  sys: { id: mockedPage1_1_1SysId, contentTypeId },
  parent: { sys: { id: mockedPage1_1.sys.id } },
  path: mockedPage1_1.path + "/" + mockedPage1_1_1SysId,
  slug: mockedPage1_1_1SysId,
  childPages: [],
};

export const mockedPage1_1_2: PageT = {
  type: "page",
  sys: { id: mockedPage1_1_2SysId, contentTypeId },
  parent: { sys: { id: mockedPage1_1.sys.id } },
  path: mockedPage1_1.path + "/" + mockedPage1_1_2SysId,
  slug: mockedPage1_1_2SysId,
  childPages: [],
};

export const mockedPage2: PageT = {
  type: "page",
  sys: { id: mockedPage2SysId, contentTypeId },
  parent: { sys: { id: mockedRoot.sys.id } },
  path: mockedRoot.path + "/" + mockedPage2SysId,
  slug: mockedPage2SysId,
  childPages: [{ sys: { id: mockedPage2_1SysId } }],
};

export const mockedPage2_1: PageT = {
  type: "page",
  sys: { id: mockedPage2_1SysId, contentTypeId },
  parent: { sys: { id: mockedPage2.sys.id } },
  path: mockedPage2.path + "/" + mockedPage2_1SysId,
  slug: mockedPage2_1SysId,
  childPages: [],
};

export const mockedPage3: PageT = {
  type: "page",
  sys: { id: mockedPage3SysId, contentTypeId },
  parent: { sys: { id: mockedRoot.sys.id } },
  path: mockedRoot.path + "/" + mockedPage3SysId,
  slug: mockedPage3SysId,
  childPages: [],
};

const mockedRedirect1: RedirectT = {
  type: "alias",
  sys: { id: mockedRedirect1SysId },
  page: { sys: { id: mockedRedirect1SysId } },
  path: mockedRoot.path + "/" + mockedRedirect1SysId,
  parent: { sys: { id: mockedRoot.sys.id } },
};

const mockedRedirect2: RedirectT = {
  type: "redirect",
  sys: { id: mockedRedirect2SysId },
  page: { sys: { id: mockedRedirect2SysId } },
  path: mockedRoot.path + "/" + mockedRedirect2SysId,
  parent: { sys: { id: mockedRoot.sys.id } },
};

const mockedRedirect3: RedirectT = {
  type: "alias",
  sys: { id: mockedRedirect3SysId },
  page: { sys: { id: mockedRedirect3SysId } },
  path: mockedRoot.path + "/" + mockedRedirect3SysId,
  parent: { sys: { id: mockedRoot.sys.id } },
};

export const mockedRedirects = [
  mockedRedirect1,
  mockedRedirect2,
  mockedRedirect3,
];

export const mockedPages = [
  mockedRoot,
  mockedPage1,
  mockedPage1_1,
  mockedPage1_1_1,
  mockedPage1_1_2,
  mockedPage1_2,
  mockedPage2,
  mockedPage2_1,
  mockedPage3,
  ...mockedRedirects,
];

export const mockedLocalizedSitemap: LocalizedSitemapT = {
  root: { sys: { id: mockedRoot.sys.id } },
  sitemap: new Map(
    mockedPages.map((page) => {
      if (!page.parent && page.type === "page") {
        return [page.sys.id, page];
      }
      return [page.sys.id, page];
    })
  ),
  pageIdByPath: new Map(mockedPages.map((page) => [page.path, page.sys.id])),
};

export const mockedPage1WithCircularReference: PageT = {
  type: "page",
  sys: { id: mockedPage1SysId, contentTypeId },
  parent: { sys: { id: mockedRoot.sys.id } },
  path: mockedRoot.path + "/" + mockedPage1SysId,
  slug: mockedPage1SysId,
  childPages: [{ sys: { id: mockedRootSysId } }],
};

export const mockedCircularReferencesPages = [
  mockedRoot,
  mockedPage1WithCircularReference,
];

export const mockedLocalizedSitemapWithCircularReference: LocalizedSitemapT = {
  root: { sys: mockedRoot.sys },
  sitemap: new Map(
    mockedCircularReferencesPages.map((page) => [page.sys.id, page])
  ),
  pageIdByPath: new Map(
    mockedCircularReferencesPages.map((page) => [page.path, page.sys.id])
  ),
};
