import { ContentTypeT } from "../../../clients/contentful-client/contentful-client";
import {
  validatePageContentType,
  validateRedirectContentType,
} from "./validate-content-types";

describe(validatePageContentType, () => {
  const basicSlugFieldId = "slug";
  const basicPageContentType: ContentTypeT = {
    sys: { id: "page" },
    fields: [
      { id: basicSlugFieldId, localized: false, name: "Slug", type: "Symbol" },
    ],
  };
  const basicPageContentTypeConfig = {
    id: basicPageContentType.sys.id,
    slugFieldId: "slug",
  };

  test("Validate invalid content type configuration", () => {
    const invalidConfig1 = {
      ...basicPageContentTypeConfig,
      slugFieldId: "invalidSlugId",
    };
    expect(
      validatePageContentType(invalidConfig1)(basicPageContentType)._tag
    ).toBe("Left");
  });
  test("Validate content type configuration", () => {
    expect(
      validatePageContentType(basicPageContentTypeConfig)(basicPageContentType)
        ._tag
    ).toBe("Right");

    const titleFieldId = "title";
    const childPagesFieldId = "childPages";
    const pageContentTypeWithOptionalFields: ContentTypeT = {
      ...basicPageContentType,
      fields: [
        ...basicPageContentType.fields,
        { id: titleFieldId, localized: false, name: "Title", type: "Symbol" },
        {
          id: childPagesFieldId,
          localized: false,
          name: "Child pages",
          type: "Array",
          items: { linkType: "Entry", type: "Link" },
        },
      ],
    };

    const pageContentTypeConfigWithOptionalFields = {
      ...basicPageContentTypeConfig,
      titleFieldId: titleFieldId,
      childPagesFieldId: childPagesFieldId,
    };

    expect(
      validatePageContentType(pageContentTypeConfigWithOptionalFields)(
        pageContentTypeWithOptionalFields
      )._tag
    ).toBe("Right");
  });
});

describe(validateRedirectContentType, () => {
  const pageFieldId = "page";
  const pathFieldId = "path";
  const typeFieldId = "type";
  const basicRedirectContentType: ContentTypeT = {
    sys: { id: "redirect" },
    fields: [
      { id: pageFieldId, localized: false, name: "Page", type: "Link" },
      { id: pathFieldId, localized: false, name: "Path", type: "Symbol" },
      { id: typeFieldId, localized: false, name: "Type", type: "Symbol" },
    ],
  };
  const basicRedirectContentTypeConfig = {
    pageFieldId,
    pathFieldId,
    typeFieldId,
  };

  test("Validate invalid content type configuration", () => {
    const invalidConfig1 = {
      ...basicRedirectContentTypeConfig,
      pathFieldId: "invalidPathId",
    };
    expect(
      validateRedirectContentType(invalidConfig1)(basicRedirectContentType)._tag
    ).toBe("Left");
  });
  test("Validate content type configuration", () => {
    expect(
      validateRedirectContentType(basicRedirectContentTypeConfig)(
        basicRedirectContentType
      )._tag
    ).toBe("Right");

    const titleFieldId = "title";
    const redirectContentTypeWithOptionalFields: ContentTypeT = {
      ...basicRedirectContentType,
      fields: [
        ...basicRedirectContentType.fields,
        { id: titleFieldId, localized: false, name: "Title", type: "Symbol" },
      ],
    };

    const redirectContentTypeConfigWithOptionalFields = {
      ...basicRedirectContentTypeConfig,
      titleFieldId: titleFieldId,
    };

    expect(
      validateRedirectContentType(redirectContentTypeConfigWithOptionalFields)(
        redirectContentTypeWithOptionalFields
      )._tag
    ).toBe("Right");
  });
});
