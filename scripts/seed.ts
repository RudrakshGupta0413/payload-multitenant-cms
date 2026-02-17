import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const richText = (text: string) => ({
    root: {
        type: 'root',
        children: [
            {
                type: 'paragraph',
                children: [{ type: 'text', text, version: 1 }],
                direction: 'ltr' as const, format: '' as const, indent: 0, version: 1,
            },
        ],
        direction: 'ltr' as const, format: '' as const, indent: 0, version: 1,
    },
})

async function seed() {
    console.log('🌱 Starting seed...\n')
    const payload = await getPayload({ config })

    // Clean up
    console.log('🧹 Cleaning up...')
    try {
        for (const col of ['misrut-blogs', 'synrgy-blogs', 'tenants'] as const) {
            const existing = await payload.find({ collection: col, limit: 100 })
            for (const doc of existing.docs) {
                await payload.delete({ collection: col, id: doc.id })
            }
        }
    } catch (_) { }

    // Tenants
    console.log('📌 Creating tenants...')
    const misrut = await payload.create({
        collection: 'tenants',
        data: { title: 'Misrut', slug: 'misrut', domain: 'misrut.localhost' },
    })
    const synrgy = await payload.create({
        collection: 'tenants',
        data: { title: 'Synrgy', slug: 'synrgy', domain: 'synrgy.localhost' },
    })

    // Admin user
    console.log('👤 Creating admin...')
    const existingUsers = await payload.find({
        collection: 'users',
        where: { email: { equals: 'admin@example.com' } },
    })
    if (existingUsers.docs.length === 0) {
        await payload.create({
            collection: 'users',
            data: { email: 'admin@example.com', password: 'admin123' },
        })
        console.log('  ✅ admin@example.com / admin123')
    }

    // ─── Misrut Blog Posts (8 posts) ───
    console.log('\n📝 Creating Misrut blogs...')
    const misrutPosts = [
        { title: 'The Art of Minimalist Design', slug: 'the-art-of-minimalist-design', content: richText('Less is more. In a world overloaded with information, minimalist design cuts through the noise and speaks directly to the user. We explore the principles that guide our design philosophy at Misrut.') },
        { title: 'Building Scalable Web Applications', slug: 'building-scalable-web-apps', content: richText('Scalability isn\'t an afterthought — it\'s a mindset. From database design to API architecture, every decision matters when you\'re building for millions of users.') },
        { title: 'Why We Chose Payload CMS', slug: 'why-we-chose-payload-cms', content: richText('After evaluating a range of headless CMS platforms, we settled on Payload CMS for its developer-first approach, TypeScript support, and incredible flexibility.') },
        { title: 'Introduction to Multi-Tenancy', slug: 'introduction-to-multi-tenancy', content: richText('Multi-tenancy allows multiple customers to share a single application while keeping their data isolated. Here\'s how we implemented it and why it matters.') },
        { title: 'Our Journey with Next.js 15', slug: 'our-journey-with-nextjs-15', content: richText('Next.js 15 introduced App Router, Server Components, and powerful streaming capabilities. We share our experience migrating and the performance gains we achieved.') },
        { title: 'Design Systems That Scale', slug: 'design-systems-that-scale', content: richText('A design system is more than a component library. It\'s a shared language between designers and developers that ensures consistency across every product touchpoint.') },
        { title: 'The Future of Content Management', slug: 'the-future-of-content-management', content: richText('Headless CMS, composable architectures, and AI-powered content — the future of content management is modular, flexible, and developer-friendly.') },
        { title: 'Docker in Production: Lessons Learned', slug: 'docker-in-production-lessons-learned', content: richText('Running Docker in production taught us valuable lessons about networking, volumes, health checks, and the importance of proper orchestration.') },
    ]
    for (const post of misrutPosts) {
        await payload.create({ collection: 'misrut-blogs', data: { ...post, tenant: misrut.id } as any })
        console.log(`  ✅ ${post.title}`)
    }

    // ─── Synrgy Blog Posts (8 posts) ───
    console.log('\n📝 Creating Synrgy blogs...')
    const synrgyPosts = [
        { title: '12 Customer Satisfaction Questions That Reveal Real Insights', slug: '12-customer-satisfaction-questions', content: richText('Customer satisfaction surveys getting vague answers? The problem isn\'t your customers — it\'s your questions. Use these 12 CSAT questions to ask the right questions at the right time.') },
        { title: 'Keep It Moving: From Forms to Workflows', slug: 'keep-it-moving-forms-to-workflows', content: richText('Forms are just the beginning. Learn how to transform static form submissions into dynamic, automated workflows that save time and reduce manual effort.') },
        { title: 'Online Surveys: How to Conduct a Survey in 7 Steps', slug: 'online-surveys-7-steps', content: richText('Creating effective online surveys is both an art and a science. Follow these 7 proven steps to design surveys that get high response rates and actionable insights.') },
        { title: 'The Future of Employee Engagement', slug: 'the-future-of-employee-engagement', content: richText('Employee engagement is evolving from one-time campaigns to continuous relationships. Discover how leading companies are building cultures of ongoing dialogue and feedback.') },
        { title: '14 Ranking Survey Question Examples for 2026', slug: '14-ranking-survey-question-examples', content: richText('Ranking questions help you understand priorities and preferences in ways that other question types can\'t. Here are 14 proven examples you can adapt for your next survey.') },
        { title: 'Why Event Registration Experience Matters', slug: 'why-event-registration-experience-matters', content: richText('Your event registration form is the first impression attendees have of your event. A clunky process can turn potential attendees away before they even sign up.') },
        { title: 'Write Survey Introductions That Convert', slug: 'write-survey-introductions-that-convert', content: richText('The introduction to your survey can make or break your response rate. Learn how to write compelling introductions that entice people to start and complete your surveys.') },
        { title: 'A Human Approach to Employee Engagement', slug: 'a-human-approach-to-employee-engagement', content: richText('Shifting from metrics to cultural mindset — how focusing on human connection, purpose, and trust creates deeper engagement than any KPI dashboard ever could.') },
    ]
    for (const post of synrgyPosts) {
        await payload.create({ collection: 'synrgy-blogs', data: { ...post, tenant: synrgy.id } as any })
        console.log(`  ✅ ${post.title}`)
    }

    console.log('\n🎉 Seeding complete!')
    console.log(`  • ${misrutPosts.length} Misrut blogs, ${synrgyPosts.length} Synrgy blogs`)
    console.log('  • 1 Featured + 4 Latest + 3 Editors Choice per tenant\n')
    process.exit(0)
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1) })
