import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import all collections
import { Users } from './collections/Users'
import { Companies } from './collections/Companies'
import { Categories } from './collections/Categories'
import { Courses } from './collections/Courses'
import { Pills } from './collections/Pills'
import { Tools } from './collections/Tools'
import { Guides } from './collections/Guides'
import { Quizzes } from './collections/Quizzes'
import { Questions } from './collections/Questions'
import { Options } from './collections/Options'
import { CompanyCourseAccess } from './collections/CompanyCourseAccess'
import { UserProgress } from './collections/UserProgress'
import { CourseCompletions } from './collections/CourseCompletions'
import { QuizAttempts } from './collections/QuizAttempts'
import { Certificates } from './collections/Certificates'
import { TeresiLedger } from './collections/TeresiLedger'
import { Badges } from './collections/Badges'
import { UserBadges } from './collections/UserBadges'
import { Reviews } from './collections/Reviews'
import { Coupons } from './collections/Coupons'
import { Referrals } from './collections/Referrals'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.DATABASE_URI) {
  throw new Error(
    'DATABASE_URI environment variable is not set. ' +
      'Copy .env.example to .env and configure your database connection. ' +
      'Example: DATABASE_URI=postgresql://tereso:tereso@localhost:5432/tereso',
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Companies,
    Categories,
    Courses,
    Pills,
    Tools,
    Guides,
    Quizzes,
    Questions,
    Options,
    CompanyCourseAccess,
    UserProgress,
    CourseCompletions,
    QuizAttempts,
    Certificates,
    TeresiLedger,
    Badges,
    UserBadges,
    Reviews,
    Coupons,
    Referrals,
    Media,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
  }),
  sharp,
})
