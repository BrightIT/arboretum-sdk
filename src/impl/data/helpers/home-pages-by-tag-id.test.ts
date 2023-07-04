import { EntryT } from '../../../clients/contentful-client/contentful-client';
import { jsonStrigifyMapReplacer } from '../../../utils/json-stringify-map-replacer';
import { ArboretumClientCtx } from '../../arboretum-client.impl';
import { LocalesT } from '../locales';
import { homePagesByTagId, HomePagesByTagIdT } from './home-pages-by-tag-id';

const ctx: Pick<ArboretumClientCtx, 'localeTagIdPrefix' | 'pageHomeTagId'> = {
  localeTagIdPrefix: 'locale',
  pageHomeTagId: 'pageHome',
};
const locales: LocalesT = {
  defaultLocaleCode: 'en',
  locales: new Map([
    ['en', { code: 'en', default: true, fallbackCode: null, name: 'English' }],
    ['de', { code: 'de', default: false, fallbackCode: null, name: 'German' }],
    [
      'en-AT',
      { code: 'en-AT', default: false, fallbackCode: 'en', name: 'English' },
    ],
  ]),
};

const emptyHomePagesByTagId: HomePagesByTagIdT = {
  homePagesByTagId: new Map(),
};

describe(homePagesByTagId, () => {
  test('Home pages of empty entries', () => {
    expect(homePagesByTagId(ctx, locales, [])).toMatchObject(
      emptyHomePagesByTagId,
    );
  });

  test('Home pages of entries without metadata', () => {
    const entries: Array<{
      metadata: EntryT['metadata'];
      sys: Pick<EntryT['sys'], 'id'>;
    }> = [
      { sys: { id: 'test1' }, metadata: undefined },
      { sys: { id: 'test2' }, metadata: undefined },
    ];

    expect(homePagesByTagId(ctx, locales, entries)).toMatchObject(
      emptyHomePagesByTagId,
    );
  });

  test('Home pages of entries with home page metadata', () => {
    const test1SysId = 'test1';

    const entries: Array<{
      metadata: EntryT['metadata'];
      sys: Pick<EntryT['sys'], 'id'>;
    }> = [
      {
        sys: { id: test1SysId },
        metadata: { tags: [{ sys: { id: ctx.pageHomeTagId } }] },
      },
      {
        sys: { id: 'test2' },
        metadata: { tags: [{ sys: { id: 'someOtherTag' } }] },
      },
    ];

    const r: HomePagesByTagIdT = {
      homePagesByTagId: new Map([
        ['en', new Map([[ctx.pageHomeTagId, [{ sys: { id: test1SysId } }]]])],
        ['de', new Map([[ctx.pageHomeTagId, [{ sys: { id: test1SysId } }]]])],
        [
          'en-AT',
          new Map([[ctx.pageHomeTagId, [{ sys: { id: test1SysId } }]]]),
        ],
      ]),
    };

    expect(
      JSON.stringify(
        homePagesByTagId(ctx, locales, entries),
        jsonStrigifyMapReplacer,
      ),
    ).toBe(JSON.stringify(r, jsonStrigifyMapReplacer));
  });

  test('Home pages of entries with home page and locales metadata', () => {
    const test1SysId = 'test1';
    const test3SysId = 'test3';
    const test4SysId = 'test4';

    const entries: Array<{
      metadata: EntryT['metadata'];
      sys: Pick<EntryT['sys'], 'id'>;
    }> = [
      {
        sys: { id: test1SysId },
        metadata: {
          tags: [
            { sys: { id: ctx.pageHomeTagId } },
            { sys: { id: `${ctx.localeTagIdPrefix}EnAt` } },
          ],
        },
      },
      {
        sys: { id: 'test2' },
        metadata: { tags: [{ sys: { id: 'someOtherTag' } }] },
      },
      {
        sys: { id: test3SysId },
        metadata: {
          tags: [
            { sys: { id: ctx.pageHomeTagId } },
            { sys: { id: `${ctx.localeTagIdPrefix}De` } },
          ],
        },
      },
      {
        sys: { id: test4SysId },
        metadata: {
          tags: [
            { sys: { id: ctx.pageHomeTagId } },
            { sys: { id: `${ctx.localeTagIdPrefix}En` } },
          ],
        },
      },
    ];

    const r: HomePagesByTagIdT = {
      homePagesByTagId: new Map([
        [
          'en-AT',
          new Map([[ctx.pageHomeTagId, [{ sys: { id: test1SysId } }]]]),
        ],
        ['de', new Map([[ctx.pageHomeTagId, [{ sys: { id: test3SysId } }]]])],
        ['en', new Map([[ctx.pageHomeTagId, [{ sys: { id: test4SysId } }]]])],
      ]),
    };

    expect(
      JSON.stringify(
        homePagesByTagId(ctx, locales, entries),
        jsonStrigifyMapReplacer,
      ),
    ).toBe(JSON.stringify(r, jsonStrigifyMapReplacer));
  });
});
