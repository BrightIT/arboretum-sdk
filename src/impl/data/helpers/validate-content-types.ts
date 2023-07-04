import { ArboretumClientContentfulConfigOptionsT } from '../../../arboretum-client';
import { ContentTypeT } from '../../../clients/contentful-client/contentful-client';
import { Either, left, right } from '../../../utils/fp-utils';

const contentTypeValidationSuggestion =
  'Please make sure it is defined in contentful or update arboretum configuration.';

const failedToFindFieldErrMsg = (contentTypeId: string) => (fieldId: string) =>
  `Failed to find field with id: ${fieldId} in content type with id: ${contentTypeId}. ${contentTypeValidationSuggestion}`;

export const validatePageContentType =
  (
    pageContentTypeConfig: ArboretumClientContentfulConfigOptionsT['pageContentTypes'][string],
  ) =>
  (contentType: ContentTypeT): Either<string, ContentTypeT> => {
    const findField = (id: string) =>
      contentType?.fields.find(f => f.id === id);

    const { slugFieldId, childPagesFieldId, titleFieldId } =
      pageContentTypeConfig;
    const slugField = findField(slugFieldId);
    const titleField = titleFieldId ? findField(titleFieldId) : undefined;
    const childPagesField = childPagesFieldId
      ? findField(childPagesFieldId)
      : undefined;

    const fieldErrMsg = failedToFindFieldErrMsg(contentType.sys.id);

    if (!slugField) {
      return left(fieldErrMsg(slugFieldId));
    } else if (titleFieldId && !titleField) {
      return left(fieldErrMsg(titleFieldId));
    } else if (childPagesFieldId && !childPagesField) {
      return left(fieldErrMsg(childPagesFieldId));
    } else {
      return right(contentType);
    }
  };

export const validateRedirectContentType =
  (
    redirectContentTypeConfig: Pick<
      NonNullable<
        ArboretumClientContentfulConfigOptionsT['redirectContentType']
      >,
      'pageFieldId' | 'pathFieldId' | 'titleFieldId' | 'typeFieldId'
    >,
  ) =>
  (contentType: ContentTypeT): Either<string, ContentTypeT> => {
    const findField = (id: string) =>
      contentType?.fields.find(f => f.id === id);

    const { pageFieldId, pathFieldId, titleFieldId, typeFieldId } =
      redirectContentTypeConfig;
    const pageField = findField(pageFieldId);
    const pathField = findField(pathFieldId);
    const typeField = findField(typeFieldId);
    const titleField = titleFieldId ? findField(titleFieldId) : undefined;
    const fieldErrMsg = failedToFindFieldErrMsg(contentType.sys.id);

    if (!pageField) {
      return left(fieldErrMsg(pageFieldId));
    } else if (!pathField) {
      return left(fieldErrMsg(pathFieldId));
    } else if (!typeField) {
      return left(fieldErrMsg(typeFieldId));
    } else if (titleFieldId && !titleField) {
      return left(fieldErrMsg(titleFieldId));
    } else {
      return right(contentType);
    }
  };
