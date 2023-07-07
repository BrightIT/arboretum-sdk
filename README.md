<h3 align="center">
  <a href="https://gcanti.github.io/fp-ts/">
    <img src="./docs/logo.svg">
  </a>
</h3>

<p align="center">
Arboretum - The sitemap for contentful
</p>

# Installation

To install the stable version:

```
yarn add @p8marketing/arboretum-sdk
```

# Examples

```ts
import { createArboretumClientFromCdaParams } from "arboretum-sdk"


(async() => {
    const {client, warnings} = await createArboretumClientFromCdaParams({
        preview: false,
        contentful: {
          space: "[CONTENTFUL SPACE]",
          environment: "[CONTENTFUL ENVIRONMENT]",
          accessToken: "[CONTENTFUL CDA/CPA ACCESS TOKEN]",
          // Sample page content type configuration
          options: {
            pageContentTypes: {
              page: {
                slugFieldId: "slug",
                titleFieldId: "slug",
                childPagesFieldId: "childPages"
              }
            }
          }
        }
      });

      const blogPage = await client.pageByPath("/en/blog")
})()
```

This example creates arboretum client and retrieves sample page by path.
