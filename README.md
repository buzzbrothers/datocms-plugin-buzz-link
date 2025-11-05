# DatoCMS Plugin Buzz Link

This plugin allows you to simply create some links to some dato model entries or to external URLs with some options like id and target.

- [DatoCMS Plugin Buzz Link](#datocms-plugin-buzz-link)
  - [Features](#features)
  - [Usage](#usage)
  - [JSON output](#json-output)

![DatoCMS Plugin Buzz Link Preview](./docs/datocms-plugin-buzz-link-preview.webp)

## Features

1. Support Dato models linking
2. Support custom URL's
3. Support custom link text
4. Support target `_self`, `_blank`

## Usage

To create a media grid, simply follow these steps:

1. Add a `JSON` field
2. Under `Presentation`, choose `Link`
3. Click on `Save field`

![DatoCMS Plugin Buzz Link Configuration](./docs/datocms-plugin-buzz-link-configuration.webp)

## JSON output

The output of this plugin is a simple JSON that is structured like so:

```json
{
  "id": "...", // optional id specified in the editor
  "title": "...",
  "text": "...",
  "url": "...", // same as href (for convinience)
  "href": "...", // same as url (for convinience)
  "target": "_self", // _self or _blank
  "recordId": "...",
  "type": "..." // Dato model __typename like "PageRecord", etc...
}
```
