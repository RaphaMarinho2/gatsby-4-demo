const path = require('path')
const slugify = require('@sindresorhus/slugify')

exports.createSchemaCustomization = function createSchemaCustomization({
  actions,
  schema,
}) {
  const { createTypes } = actions
  const typeDefs = [
    `
    type Frontmatter @dontInfer {
      title: String!
      date: Date! @dateformat
      description: String
    }
  `,
    schema.buildObjectType({
      name: 'MarkdownRemark',
      fields: {
        frontmatter: 'Frontmatter!',
        slug: {
          type: 'String!',
          resolve(parent) {
            return slugify(parent.frontmatter.title)
          },
        },
      },
      interfaces: ['Node'],
      extensions: {
        infer: true,
      },
    }),
  ]

  createTypes(typeDefs)
}

/**
 * Create DSG pages
 */
exports.createPages = async function createPages({
  graphql,
  actions,
  reporter,
}) {
  const { data, errors } = await graphql(`
    {
      allMarkdownRemark {
        nodes {
          id
          slug
        }
      }
    }
  `)

  if (errors) {
    for (const error of errors) {
      reporter.panic(error.message)
    }
  }
}
