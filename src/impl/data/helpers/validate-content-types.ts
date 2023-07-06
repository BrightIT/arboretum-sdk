import { ArboretumClientContentfulConfigOptionsT } from "../../../arboretum-client";
import { ContentTypeT } from "../../../clients/contentful-client/contentful-client";
import { Either, left, right } from "../../../utils/fp-utils";

const contentTypeValidationSuggestion =
  "Please make sure it is defined in contentful or update arboretum configuration.";

const failedToFindFieldErrMsg = (contentTypeId: string) => (fieldId: string) =>
  `Failed to find field with id: ${fieldId} in content type with id: ${contentTypeId}. ${contentTypeValidationSuggestion}`;

const invalidFieldTypePrefixErrMsg = (contentTypeId: string, fieldId: string) =>
  `Invalid content type field type (content_type: ${contentTypeId}, field: ${fieldId})`;

const invalidFieldTypeErrMsg = (
  contentTypeId: string,
  fieldId: string,
  currentFieldType: string,
  expectedFieldType: string
) =>
  `${invalidFieldTypePrefixErrMsg(
    contentTypeId,
    fieldId
  )} - current field type: ${currentFieldType}, expected: ${expectedFieldType}`;

export const validatePageContentType =
  (
    pageContentTypeConfig: ArboretumClientContentfulConfigOptionsT["pageContentTypes"][string]
  ) =>
  (contentType: ContentTypeT): Either<string, ContentTypeT> => {
    const findField = (id: string) =>
      contentType?.fields.find((f) => f.id === id);

    const { slugFieldId, childPagesFieldId, titleFieldId } =
      pageContentTypeConfig;
    const slugField = findField(slugFieldId);
    const titleField = titleFieldId ? findField(titleFieldId) : undefined;
    const childPagesField = childPagesFieldId
      ? findField(childPagesFieldId)
      : undefined;

    const fieldErrMsg = failedToFindFieldErrMsg(contentType.sys.id);

    const slugFieldExpectedType = "Symbol";
    const titleFieldExpectedType = "Symbol";
    const childPagesFieldExpectedType = "Array";
    const childPagesFieldExpectedItemsType = "Link";
    const childPagesFieldExpectedItemsLinkType = "Entry";

    if (!slugField) {
      return left(fieldErrMsg(slugFieldId));
    } else if (slugField.type !== slugFieldExpectedType) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          slugField.id,
          slugField.type,
          slugFieldExpectedType
        )
      );
    } else if (titleFieldId && !titleField) {
      return left(fieldErrMsg(titleFieldId));
    } else if (
      titleFieldId &&
      titleField &&
      titleField.type !== titleFieldExpectedType
    ) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          titleField.id,
          titleField.type,
          titleFieldExpectedType
        )
      );
    } else if (childPagesFieldId && !childPagesField) {
      return left(fieldErrMsg(childPagesFieldId));
    } else if (
      childPagesFieldId &&
      childPagesField &&
      childPagesField.type !== childPagesFieldExpectedType
    ) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          childPagesField.id,
          childPagesField.type,
          childPagesFieldExpectedType
        )
      );
    } else if (
      childPagesFieldId &&
      childPagesField &&
      childPagesField.items?.type !== childPagesFieldExpectedItemsType
    ) {
      return left(
        `${invalidFieldTypePrefixErrMsg(
          contentType.sys.id,
          childPagesField.id
        )} - current field items type: ${
          childPagesField.items?.type
        }, expected: ${childPagesFieldExpectedItemsType}`
      );
    } else if (
      childPagesFieldId &&
      childPagesField &&
      childPagesField.items?.linkType !== childPagesFieldExpectedItemsLinkType
    ) {
      return left(
        `${invalidFieldTypePrefixErrMsg(
          contentType.sys.id,
          childPagesField.id
        )} - current field items link type: ${
          childPagesField.items?.linkType
        }, expected: ${childPagesFieldExpectedItemsLinkType}`
      );
    } else {
      return right(contentType);
    }
  };

export const validateRedirectContentType =
  (
    redirectContentTypeConfig: Pick<
      NonNullable<
        ArboretumClientContentfulConfigOptionsT["redirectContentType"]
      >,
      "pageFieldId" | "pathFieldId" | "titleFieldId" | "typeFieldId"
    >
  ) =>
  (contentType: ContentTypeT): Either<string, ContentTypeT> => {
    const findField = (id: string) =>
      contentType?.fields.find((f) => f.id === id);

    const { pageFieldId, pathFieldId, titleFieldId, typeFieldId } =
      redirectContentTypeConfig;
    const pageField = findField(pageFieldId);
    const pathField = findField(pathFieldId);
    const typeField = findField(typeFieldId);
    const titleField = titleFieldId ? findField(titleFieldId) : undefined;
    const fieldErrMsg = failedToFindFieldErrMsg(contentType.sys.id);
    const pageFieldExpectedType = "Link";
    const pathFieldExpectedType = "Symbol";
    const typeFieldExpectedType = "Symbol";
    const titleFieldExpectedType = "Symbol";

    if (!pageField) {
      return left(fieldErrMsg(pageFieldId));
    } else if (pageField.type !== pageFieldExpectedType) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          pageField.id,
          pageField.type,
          pageFieldExpectedType
        )
      );
    } else if (!pathField) {
      return left(fieldErrMsg(pathFieldId));
    } else if (pathField.type !== pathFieldExpectedType) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          pathField.id,
          pathField.type,
          pathFieldExpectedType
        )
      );
    } else if (!typeField) {
      return left(fieldErrMsg(typeFieldId));
    } else if (typeField.type !== typeFieldExpectedType) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          typeField.id,
          typeField.type,
          typeFieldExpectedType
        )
      );
    } else if (titleFieldId && !titleField) {
      return left(fieldErrMsg(titleFieldId));
    } else if (
      titleFieldId &&
      titleField &&
      titleField.type !== titleFieldExpectedType
    ) {
      return left(
        invalidFieldTypeErrMsg(
          contentType.sys.id,
          titleField.id,
          titleField.type,
          titleFieldExpectedType
        )
      );
    } else {
      return right(contentType);
    }
  };
