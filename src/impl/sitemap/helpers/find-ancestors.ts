import { LocalizedSitemapT, PageT } from '../../arboretum-client.impl';

const findAncestorsRecursively = (
  sitemap: LocalizedSitemapT['sitemap'],
  page: PageT,
): Array<PageT> => {
  const maybeParentRef = page?.parent?.sys;
  const maybeParent = maybeParentRef
    ? sitemap.get(maybeParentRef.id)
    : undefined;
  return maybeParent && maybeParent.type === 'page'
    ? [maybeParent, ...findAncestorsRecursively(sitemap, maybeParent)]
    : [];
};

export const findAncestors = (
  { root, sitemap }: LocalizedSitemapT,
  page: PageT,
): Array<PageT> | undefined => {
  const ancestors = findAncestorsRecursively(sitemap, page);
  const maybeHomePageAncestor = ancestors
    .slice(-1)
    .find(page => page.sys.id === root.sys.id);
  return maybeHomePageAncestor ? ancestors : undefined;
};
