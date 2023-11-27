import type { Schema, Attribute } from '@strapi/strapi'

export interface ConfigurationScrapeEntryPoint extends Schema.Component {
  collectionName: 'components_configuration_scrape_entry_points'
  info: {
    displayName: 'scrapeUrl'
    description: ''
  }
  attributes: {
    startUrl: Attribute.String & Attribute.Required
    depth: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0
      }>
    prompts: Attribute.Relation<
      'configuration.scrape-entry-point',
      'oneToMany',
      'api::prompt.prompt'
    >
  }
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'configuration.scrape-entry-point': ConfigurationScrapeEntryPoint
    }
  }
}
