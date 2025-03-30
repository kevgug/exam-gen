# exam-gen
Generate unofficial STEM practice exams based on official materials.

# ExamGen: One Practice Exam. Unlimited Learning.

## Inspiration

We noticed something wasn't right. College STEM students get just one practice exam, while high school IB students get 40× more per subject. That's not fair.

Our teammate Kevin experienced this firsthand. Despite knowing the statistical concepts for his midterm, he scored below average simply because he wasn't familiar with how his professor wanted answers structured. Frustrated but determined, Kevin took the single practice exam provided and used chatbots to generate unofficial practice materials with similar problems. The result? He jumped from below average to scoring a full standard deviation above the class on his final. 

That's when it clicked for us: one practice exam isn't enough. But the solution needed to be better than just asking LLMs to generate answers - especially for math-heavy subjects where AI often confidently presents incorrect solutions.

## What it does

ExamGen takes that lonely practice exam and turns it into something magical—unlimited practice materials that actually work.

Unlike other AI solutions, we don't just generate questions. We verify every calculation. Every solution. Every mark.

Your professor has specific expectations. We help you meet them, over and over, until excellence becomes reflex.

## How we built it

After quickly settling on this problem, we spent the first few hours discussing schema and data structures before building out our backend. We built the server with Node.js and Express.js, using TypeScript for strong typing. On the client side, we used Next.js, React, Tailwind, and Shadcn for a clean and performant UI.

Our team split responsibilities efficiently: Max built out the local database and Express endpoints, while Kevin focused more on LLM integration, working with Vercel AI and our sponsor Freestyle's computational execution capabilities. 

We used Git for tracking changes within the team and communicated clearly about our individual tasks to prevent conflicts. This workflow allowed us to build a system that integrates powerful AI generation with computational verification to produce accurate practice materials.

## Challenges we ran into

Our biggest technical hurdle was getting the LLM to output correctly structured data for the exams when uploading them to the platform. 

We had a particular "aha" moment (more like an "oh no" moment) when we realized questions needed to be represented recursively because of subquestions. This required a significant rethinking of our data structure mid-development.

Beyond the technical challenges, we faced the fundamental difficulty of ensuring mathematical accuracy in AI-generated content—a problem we solved by implementing Freestyle's computational verification rather than relying solely on LLM outputs.

## Accomplishments that we're proud of

We had more ideas than time, because the problem is real. However, we're proud of what we managed to build within our planned scope.

Max's PDF visualizer of generated exams is especially cool as it brings the effort of the whole project together, transforming raw data into professional-looking practice materials that feel authentic.

Most importantly, we built something that addresses a genuine need we've experienced firsthand—proof that sometimes the best projects come from solving your own problems.

## What we learned

The difference between an A and a C often isn't knowledge—it's presentation.

AI without computational verification is just confident guessing. And in STEM, guessing fails.

Students don't need more content. They need the right content, verified and aligned with their specific course expectations.

Building this project taught us that sometimes the simplest ideas—"let's make more practice exams"—solve the most frustrating problems.

## What's next for ExamGen

We'll certainly use it ourselves, and very likely keep working on this project to see how much more it can help us and other college students.

We're planning to expand to more STEM disciplines, add professor-specific customization options, and build tools to help study groups collaborate.

Soon, we'll add analytics that spot weak points before they show up on exam day.

Our vision? No student should ever walk into an exam wondering "is this what my professor wants?" They should know, because they've practiced it dozens of times.

One exam is never enough. With ExamGen, one is all you need.
