<h3 align="center">
  <a href="https://gcanti.github.io/fp-ts/">
    <img src="./logo.svg">
  </a>
</h3>

<p align="center">
Arboretum - The sitemap for contentful
</p>

# Introduction

`@p8marketing/arboretum-sdk` is a library for building sitemaps in [Contentful](https://www.contentful.com/).

- **Dynamic:** Arboretum SDK builds sitemap dynamically based on the pages structure defined in Contentful. There are no hard-coded paths, so editors have full power over the sitemap.
- **Customizable:** Content types that represent pages are configurable, so you can integrate Arboretum SDK even in existing projects.
- **Efficient:** Number of requests to Contentful is minimalized.
- **Lazy:** By default sitemap is built only for locales that were explicitly requested.
- **In memory:** Sitemap is stored in memory, so no other dependencies (e.g. database) are required.

# Installation

To install the stable version:

```
yarn add @p8marketing/arboretum-sdk
```

# Create client

Basically, there are 3 ways to create Arboretum SDK client:

- By providing required credentials by hand

```ts
import { createArboretumClientFromCdaParams } from "@p8marketing/arboretum-sdk";

(async () => {
  const { client, warnings } = await createArboretumClientFromCdaParams({
    preview: false,
    contentful: {
      space: "[CONTENTFUL SPACE]",
      environment: "[CONTENTFUL ENVIRONMENT]",
      accessToken: "[CONTENTFUL CDA/CPA ACCESS TOKEN]",
      // Sample page content type configuration
      options: {
        pageContentTypes: {
          page: {
            titleFieldId: "name",
            slugFieldId: "slug",
            childPagesFieldId: "childPages",
          },
        },
      },
    },
    // Client configuration options
    options: {},
  });
})();
```

- By providing contentful CDA client

```ts
import { createArboretumClientFromCdaClient } from "@p8marketing/arboretum-sdk";
import { createClient } from "contentful";

const contentfulClient = createClient({
  space: "[CONTENTFUL SPACE]",
  environment: "[CONTENTFUL ENVIRONMENT]",
  accessToken: "[CONTENTFUL CDA/CPA ACCESS TOKEN]",
});

(async () => {
  const { client, warnings } = await createArboretumClientFromCdaClient({
    preview: false,
    contentful: {
      client: contentfulClient,
      // Sample page content type configuration
      options: {
        pageContentTypes: {
          page: {
            titleFieldId: "name",
            slugFieldId: "slug",
            childPagesFieldId: "childPages",
          },
        },
      },
    },
    // Client configuration options
    options: {},
  });
})();
```

- By providing contentful CMA client (especially useful in contentful apps)

```ts
import { createArboretumClientFromCma } from "@p8marketing/arboretum-sdk";
import { createClient } from "contentful-management";

async () => {
  const cmaClient = createClient({
    accessToken: "[CONTENTFUL CDA/CPA ACCESS TOKEN]",
  });

  const spaceClient = await cmaClient.getSpace("[CONTENTFUL SPACE]");

  const environmentClient = await spaceClient.getEnvironment(
    "[CONTENTFUL ENVIRONMENT]"
  );

  const { client, warnings } = await createArboretumClientFromCma({
    preview: false,
    contentful: {
      client: environmentClient,
      // Sample page content type configuration
      options: {
        pageContentTypes: {
          page: {
            titleFieldId: "name",
            slugFieldId: "slug",
            childPagesFieldId: "childPages",
          },
        },
      },
    },
    // Client configuration options
    options: {},
  });
};
```

In this step all data required to calculate sitemap is fetched and stored in internal memory. That's the only place where dynamic requests to Contentful are happening. All subsequent interactions with the Arboretum SDK client rely on the data fetched in this step.

### Client configuration options

|                    | Default | Description                                                                                                                                                                                                            |
| ------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| eageryly           | false   | by default localized sitemap is generated only for locales that were explicitly requested. When set to `true` sitemap is generated for every locale in advance.                                                        |
| data               |         | you can cache data computed during previous Arboretum SDK client initialization (`client.cachedData` method) and use it to create a new client. When this parameter is defined all requests to Contentful are skipped. |
| includeEntryStatus | false   | only for Arboretum SDK clients that were created based on Contentful CMA. When set to `true` page's `cmaOnlyStatus` field will be defined.                                                                             |

### Contentful configuration options

| Default             | Default  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| homePageTagId       | pageHome | sitemap root tag id                                                                                                                                                                                                                                                                                                                                                                                                                         |
| pageContentTypes    |          | **Required**. Object consisting of keys that are content type id's and values that are objects with the following keys: `titleFieldId` (field id representing page title), `slugFieldId` (field id representing page slug) and `childPagesFieldId` (optional field id representing references to child pages). Sample value: {page:{"titleFieldId":"name","slugFieldId":"slug","childPagesFieldId":"childPages"}}                           |
| redirectContentType |          | Object with the following keys: `id` (redirect content type id), `titleFieldId` (field id representing redirect title), `typeFieldId` (field id representing redirect type - either `alias` or `redirect`), `pageFieldId` (field id representing page reference), `pathFieldId` (field id representing redirect path). Sample value: {"id":"redirect","titleFieldId":"name","typeFieldId":"type","pageFieldId":"page","pathFieldId":"path"} |

# Basic usage

Most of the results returned by Arboretum SDK are wrapped by `Eider` (inspired by [fp-ts Eider](https://gcanti.github.io/fp-ts/modules/Either.ts)) where successful responses are marked with `_tag` equal to `"Right"` and failed responses are marked with `_tag` equal to `"Left"`.

```ts
const homePage = client.pageByPath("/en");
console.log(homePage);
/* prints 
  {
    _tag: 'Right',
    right: {
      type: 'page',
      id: 'ZCFBfxFPfz3iy9Rojvxva',
      title: 'home',
      localeCode: 'en',
      path: '/en',
      slug: 'home',
      totalDirectChildrenCount: 2
    }
  }

or

  { _tag: 'Left', left: 'Failed to find locale by code: en' }
  
 */

const blogPage = client.pageById("en", "4bkXR9tM8c1cGzTe7BMIgn");
console.log(blogPage);
/* prints 
  {
    _tag: "Right",
    right: {
      type: "page",
      id: "4bkXR9tM8c1cGzTe7BMIgn",
      title: "blog",
      localeCode: "en",
      path: "/en/blog",
      slug: "blog",
      totalDirectChildrenCount: 2,
    },
  }

or

  {
    _tag: "Left",
    left: "Failed to find page by id: 4bkXR9tM8c1cGzTe7BMIgn and locale: en",
  }
  
 */
```

# Documentation

- [Arboretum SDK Documentation](https://brightit.github.io/arboretum-sdk/)
