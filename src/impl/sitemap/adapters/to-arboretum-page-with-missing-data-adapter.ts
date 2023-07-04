import { ArboretumPageT } from '../../../arboretum-client';
import { PageT } from '../../arboretum-client.impl';

export const toArboretumPageWithMissingData =
  (localeCode: string) =>
  (
    page: PageT,
    ancestors: ArboretumPageT['ancestors'],
    children: ArboretumPageT['children'],
  ): ArboretumPageT => ({
    type: 'page',
    id: page.sys.id,
    title: page.title,
    cmaOnlyStatus: page.sys.cmaOnlyStatus,
    localeCode,
    path: page.path,
    slug: page.slug,
    totalDirectChildrenCount: children
      ? children.length
      : page.childPages.length,
    children,
    ancestors,
  });
