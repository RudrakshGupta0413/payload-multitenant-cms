import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { MisrutBlogs } from './collections/MisrutBlogs'
import { SynrgyBlogs } from './collections/SynrgyBlogs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Users, Media, Tenants, MisrutBlogs, SynrgyBlogs],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'alt',
                type: 'text',
                label: 'Alt Text',
              },
            ],
          },
        },
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['misrut-blogs', 'synrgy-blogs'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: { doc: { title?: string } }) => (doc?.title ? `BunderBrains — ${doc.title}` : 'BunderBrains'),
      generateDescription: ({ doc }: { doc: { title?: string } }) => doc?.title || 'Explore our latest blog posts.',
    }),
    s3Storage({
      collections: {
        media: {
          prefix: 'blog',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true, // Useful for local S3-compatible storage like MinIO
      },
    }),
  ],
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
})
