const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
})

// Updated schema for interview report with 30 questions
const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview - MUST include 30 questions"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview - MUST include 30 questions"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    try {
        console.log("🤖 AI Service: Generating interview report with 30+30 questions...");

        const prompt = `Generate an interview report for a candidate with the following details:

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY 30 TECHNICAL QUESTIONS covering all aspects of MERN stack, data structures, algorithms, and system design
2. Generate EXACTLY 30 BEHAVIORAL QUESTIONS covering teamwork, leadership, conflict resolution, project management
3. Technical questions should include topics like: MongoDB queries and indexing, Express middleware and routing, React hooks and optimization, Node.js performance and event loop, DSA problem-solving, system design, authentication, deployment, testing, etc.
4. Behavioral questions should follow STAR format in answers and cover: teamwork, leadership, conflict resolution, project management, learning agility, handling failure, etc.
5. Make questions specific to the candidate's experience from their resume
6. Technical questions should increase in difficulty from basic to advanced
7. Return ONLY valid JSON with EXACTLY the structure below

The response must be a JSON object with this exact structure:
{
    "matchScore": 85,
    "title": "Job Title Here",
    "skillGaps": [
        { "skill": "Skill Name", "severity": "high" },
        { "skill": "Skill Name", "severity": "medium" }
    ],
    "technicalQuestions": [
        { "question": "Question 1", "intention": "Intention 1", "answer": "Answer 1" },
        // ... TOTAL 30 QUESTIONS
    ],
    "behavioralQuestions": [
        { "question": "Question 1", "intention": "Intention 1", "answer": "Answer 1" },
        // ... TOTAL 30 QUESTIONS
    ],
    "preparationPlan": [
        { "day": 1, "focus": "Focus Area", "tasks": ["Task 1", "Task 2", "Task 3"] }
    ]
}`;

        console.log("📤 Sending prompt to Gemini API...");

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema),
            }
        });

        console.log("📥 Received response from Gemini API");

        const parsedResponse = JSON.parse(response.text);

        // Validate and ensure we have 30 questions in each section
        if (!parsedResponse.technicalQuestions || parsedResponse.technicalQuestions.length < 30) {
            console.warn(`⚠️ Expected 30 technical questions, got ${parsedResponse.technicalQuestions?.length || 0}`);
            parsedResponse.technicalQuestions = padTechnicalQuestions(parsedResponse.technicalQuestions || [], 30);
        }

        if (!parsedResponse.behavioralQuestions || parsedResponse.behavioralQuestions.length < 30) {
            console.warn(`⚠️ Expected 30 behavioral questions, got ${parsedResponse.behavioralQuestions?.length || 0}`);
            parsedResponse.behavioralQuestions = padBehavioralQuestions(parsedResponse.behavioralQuestions || [], 30);
        }

        console.log(`✅ Generated ${parsedResponse.technicalQuestions.length} technical and ${parsedResponse.behavioralQuestions.length} behavioral questions`);

        return parsedResponse;

    } catch (error) {
        console.error("❌ Error in generateInterviewReport:", error);
        // Return default report with 30 questions each
        return getDefaultInterviewReport();
    }
}

/**
 * @description Pad technical questions to ensure 30 total
 */
function padTechnicalQuestions(existingQuestions, targetCount = 30) {
    const defaultTechQuestions = [
        // MongoDB Questions (5)
        {
            "question": "Explain how MongoDB indexing works and how you would optimize a slow query.",
            "intention": "Assess database optimization knowledge",
            "answer": "MongoDB indexes are special data structures that store a small portion of the collection's data in an easy-to-traverse form. To optimize slow queries, you can use .explain() to analyze query performance, create appropriate indexes (single field, compound, multikey), and use covered queries where possible. You should also consider the order of fields in compound indexes and use hint() to force specific indexes."
        },
        {
            "question": "Explain MongoDB aggregation pipeline with an example of grouping and sorting.",
            "intention": "Assess MongoDB advanced query skills",
            "answer": "Aggregation pipeline processes documents through stages. Example: db.orders.aggregate([ { $match: { status: 'completed' } }, { $group: { _id: '$customerId', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }, { $limit: 10 } ]). This finds top 10 customers by total completed orders."
        },
        {
            "question": "What are the differences between SQL and NoSQL databases? When would you choose MongoDB over PostgreSQL?",
            "intention": "Assess database knowledge",
            "answer": "SQL: structured schema, relationships, ACID compliance, better for complex queries and transactions. NoSQL: flexible schema, horizontal scaling, faster for hierarchical data, better for rapid development. Choose MongoDB for unstructured data, high write loads, rapid prototyping, or when you need to scale horizontally easily."
        },
        {
            "question": "How would you design a database schema for a social media platform with users, posts, comments, and likes?",
            "intention": "Assess database design skills",
            "answer": "Users collection: { _id, name, email, createdAt }. Posts collection: { _id, userId, content, media, createdAt }. Comments collection: { _id, postId, userId, content, createdAt }. Likes collection: { _id, postId, userId, createdAt } with compound index on {postId, userId} for uniqueness. Consider embedding comments in posts for read-heavy scenarios or referencing for write-heavy scenarios."
        },
        {
            "question": "Explain MongoDB replication and sharding. When would you use each?",
            "intention": "Assess MongoDB scalability knowledge",
            "answer": "Replication creates copies of data across multiple servers for high availability and disaster recovery. Sharding distributes data across multiple servers for horizontal scaling. Use replication for read scaling and fault tolerance. Use sharding when data size exceeds single server capacity or write throughput needs to be distributed."
        },

        // Express.js Questions (5)
        {
            "question": "Explain the concept of middleware in Express. Create a custom middleware for logging.",
            "intention": "Assess Express.js knowledge",
            "answer": "Middleware functions have access to req, res, and next. They can execute code, modify req/res, end request cycle, or call next(). Custom logging middleware: app.use((req, res, next) => { console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`); next(); });"
        },
        {
            "question": "How do you handle errors in Express.js? Create a global error handler.",
            "intention": "Assess error handling skills",
            "answer": "Create error-handling middleware with four parameters: app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ message: 'Something broke!', error: err.message }); }). Use try-catch in async functions and pass errors to next()."
        },
        {
            "question": "What is CORS? How do you handle it in a MERN application?",
            "intention": "Assess cross-origin knowledge",
            "answer": "CORS (Cross-Origin Resource Sharing) is a security mechanism that restricts web pages from making requests to different domains. In Express, use cors middleware: app.use(cors({ origin: 'http://localhost:3000', credentials: true })). Configure allowed methods, headers, and preflight OPTIONS requests properly."
        },
        {
            "question": "How would you implement rate limiting in a Node.js API?",
            "intention": "Assess API security knowledge",
            "answer": "Use express-rate-limit middleware. Store request counts in memory or Redis for distributed systems. Implement different limits for different routes/users. Return appropriate headers (X-RateLimit-Limit, X-RateLimit-Remaining). Consider using token bucket or leaky bucket algorithms."
        },
        {
            "question": "Explain how you would structure a large Express application.",
            "intention": "Assess application architecture skills",
            "answer": "Use MVC pattern: models for data, controllers for business logic, routes for endpoints, services for external integrations, middleware for cross-cutting concerns. Organize by feature/module rather than technical layers. Use dependency injection for testability."
        },

        // React Questions (5)
        {
            "question": "Explain React's useEffect hook and its dependency array. What happens if you don't provide dependencies?",
            "intention": "Assess React hooks understanding",
            "answer": "useEffect runs after render. Without dependencies, it runs after every render which can cause performance issues. With empty array [], it runs once on mount. With dependencies, it runs when dependencies change. Missing dependencies can cause infinite loops or stale closures. Always include all variables from component scope that are used in the effect."
        },
        {
            "question": "How do you optimize React application performance? List at least 10 techniques.",
            "intention": "Assess React optimization knowledge",
            "answer": "1. Use React.memo for component memoization, 2. Implement useMemo and useCallback for expensive computations, 3. Code splitting with lazy loading, 4. Virtualize long lists with react-window, 5. Avoid inline functions in render, 6. Use proper key props in lists, 7. Implement shouldComponentUpdate or PureComponent, 8. Use production build, 9. Implement pagination, 10. Use Web Workers for heavy computations."
        },
        {
            "question": "How do you manage state in a large React application? Compare Redux vs Context API.",
            "intention": "Assess state management understanding",
            "answer": "Redux: centralized store, predictable state updates with reducers, middleware for side effects, time-travel debugging. Context API: built-in, simpler for small apps, but can cause unnecessary re-renders. For large apps, Redux with Redux Toolkit is recommended. Consider Zustand or Recoil as alternatives."
        },
        {
            "question": "Explain the difference between controlled and uncontrolled components in React.",
            "intention": "Assess React fundamentals",
            "answer": "Controlled components have their state managed by React using useState, with value and onChange props. Uncontrolled components store their state in the DOM, accessed via refs. Controlled components give more control and immediate validation, while uncontrolled are simpler for basic forms."
        },
        {
            "question": "What is the Virtual DOM in React and how does it work?",
            "intention": "Assess React internals knowledge",
            "answer": "Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous one (diffing), calculates the minimal updates needed, and batches these updates to the real DOM (reconciliation). This improves performance by minimizing direct DOM manipulations."
        },

        // Node.js Questions (5)
        {
            "question": "Explain the event loop in Node.js. How does it handle asynchronous operations?",
            "intention": "Assess Node.js internals knowledge",
            "answer": "The event loop allows Node.js to perform non-blocking I/O operations. It has phases: timers, pending callbacks, idle/prepare, poll, check, close. Asynchronous operations are delegated to the system kernel, and callbacks are queued in the appropriate phase. This single-threaded model with event loop enables handling many concurrent connections efficiently."
        },
        {
            "question": "How would you handle file uploads in Node.js? What are the security considerations?",
            "intention": "Assess practical Node.js skills",
            "answer": "Use multer middleware for handling multipart/form-data. Store files in cloud storage (S3) rather than locally. Implement file type validation, size limits, virus scanning, and sanitize filenames. Use streaming for large files. Consider using CDN for serving files. Implement rate limiting to prevent DoS attacks."
        },
        {
            "question": "What are streams in Node.js? Explain different types of streams.",
            "intention": "Assess Node.js advanced concepts",
            "answer": "Streams are objects that let you read/write data continuously. Four types: Readable (for reading), Writable (for writing), Duplex (both readable and writable), Transform (modify data while reading/writing). Streams are memory-efficient for large files as they process data in chunks rather than loading entirely into memory."
        },
        {
            "question": "How do you handle concurrency in Node.js? What is the worker_threads module?",
            "intention": "Assess understanding of Node.js parallelism",
            "answer": "Node.js is single-threaded but uses worker pool for I/O. For CPU-intensive tasks, use worker_threads module to create true parallel threads. Each worker has its own V8 instance and event loop. Communicate via message passing. This prevents blocking the main event loop."
        },
        {
            "question": "Explain clustering in Node.js. How does it help with scalability?",
            "intention": "Assess Node.js scalability knowledge",
            "answer": "Cluster module allows creating child processes (workers) that share server ports. Master process distributes incoming connections across workers using round-robin. This utilizes multi-core systems effectively. Use PM2 for production clustering with features like auto-restart and load balancing."
        },

        // Security Questions (5)
        {
            "question": "How do you implement authentication and authorization in a MERN stack application?",
            "intention": "Assess security implementation knowledge",
            "answer": "Using JWT tokens stored in HTTP-only cookies for authentication, implementing middleware for route protection, bcrypt for password hashing, and role-based access control for different user types. For added security, implement refresh tokens, rate limiting, and CORS properly."
        },
        {
            "question": "What are common security vulnerabilities in web applications and how do you prevent them?",
            "intention": "Assess security awareness",
            "answer": "XSS: sanitize user input, use Content-Security-Policy. CSRF: use anti-CSRF tokens, SameSite cookies. SQL Injection: use parameterized queries, ORMs. NoSQL Injection: validate/sanitize input. Use Helmet.js for security headers, implement rate limiting, keep dependencies updated."
        },
        {
            "question": "How would you securely store passwords in a database?",
            "intention": "Assess security best practices",
            "answer": "Never store plain text passwords. Use bcrypt with salt rounds (10-12) to hash passwords. bcrypt is adaptive, slow to brute-force. Add pepper (server-side secret) for extra security. Implement account lockout after failed attempts. Use HTTPS everywhere."
        },
        {
            "question": "What is JWT and how does it work? What are its advantages and disadvantages?",
            "intention": "Assess authentication knowledge",
            "answer": "JWT (JSON Web Token) is a compact, URL-safe token for securely transmitting information. Consists of header, payload, signature. Advantages: stateless, scalable, works across domains. Disadvantages: cannot be invalidated easily, size can be large, store sensitive data? No - payload is base64 encoded, not encrypted."
        },
        {
            "question": "How do you protect against brute force attacks on login endpoints?",
            "intention": "Assess security implementation",
            "answer": "Implement rate limiting (express-rate-limit). Account lockout after failed attempts. CAPTCHA for suspicious activity. Monitor and alert on unusual patterns. Use strong password policies. Implement 2FA for critical systems. Log and analyze failed attempts."
        },

        // System Design Questions (5)
        {
            "question": "How would you design a real-time notification system using Node.js and MongoDB?",
            "intention": "Assess system design skills",
            "answer": "Use WebSocket with Socket.io for real-time communication, store notifications in MongoDB with user references and read status, implement pagination for fetching old notifications, and use MongoDB change streams for real-time database updates. Consider using Redis for caching active user sessions and message queues for handling high loads."
        },
        {
            "question": "Design a URL shortener service like bit.ly. What are the key considerations?",
            "intention": "Assess system design skills",
            "answer": "Generate unique short codes (base62 encoding of IDs). Use NoSQL for high write throughput. Implement caching with Redis for frequently accessed URLs. Handle redirection with 301/302 status codes. Consider rate limiting, analytics tracking, and custom aliases. Use consistent hashing for sharding."
        },
        {
            "question": "How would you design a scalable chat application?",
            "intention": "Assess system design for real-time apps",
            "answer": "Use WebSocket for real-time messaging. Store messages in MongoDB with proper indexing. Use Redis for presence (online/offline status). Implement message queuing for reliable delivery. Consider using pub/sub pattern. For group chats, fan-out messages to recipients. Handle message history with pagination."
        },
        {
            "question": "Design an e-commerce platform with millions of users. How would you handle high traffic?",
            "intention": "Assess scalability design",
            "answer": "Microservices architecture: product service, order service, user service, payment service. Use API gateway. Implement caching at multiple levels (CDN for static, Redis for dynamic). Database sharding and replication. Use message queues for order processing. Implement rate limiting, auto-scaling, and load balancing."
        },
        {
            "question": "How would you design a video streaming platform like YouTube?",
            "intention": "Assess complex system design",
            "answer": "Use CDN for video delivery (CloudFront). Store videos in cloud storage (S3). Use adaptive bitrate streaming (HLS/DASH). Implement video processing pipeline with workers for transcoding. Database for metadata with caching. Recommendation system using machine learning. Handle uploads with resumable uploads."
        }
    ];

    const combined = [...existingQuestions, ...defaultTechQuestions];
    return combined.slice(0, targetCount);
}

/**
 * @description Pad behavioral questions to ensure 30 total
 */
function padBehavioralQuestions(existingQuestions, targetCount = 30) {
    const defaultBehavioralQuestions = [
        // Teamwork & Collaboration (6)
        {
            "question": "Tell me about a time you had to work with a difficult team member. How did you handle it?",
            "intention": "Assess conflict resolution and interpersonal skills",
            "answer": "Situation: Worked with a developer who consistently missed deadlines and didn't communicate well. Task: Needed to complete a critical project together. Action: Scheduled a private meeting to understand their challenges, offered help, suggested daily stand-ups for better communication, and redistributed tasks based on strengths. Result: Project completed on time, team communication improved, and we developed a better working relationship."
        },
        {
            "question": "Describe a situation where you disagreed with a team member about a technical approach. How did you resolve it?",
            "intention": "Assess collaboration and conflict resolution",
            "answer": "Situation: Disagreed with a colleague about using Redux vs Context API for state management. Task: Choose the best approach for our app. Action: We both researched and presented pros/cons, built small prototypes to test performance, and involved the team in a discussion. Result: Chose Redux for scalability, but documented our decision process. The disagreement actually improved our final solution."
        },
        {
            "question": "Tell me about a time you helped a junior developer grow.",
            "intention": "Assess mentorship and leadership potential",
            "answer": "Situation: New junior developer was struggling with Git and deployment process. Task: Help them become productive. Action: Set up pair programming sessions, created documentation with common workflows, reviewed their code patiently, and encouraged questions. Result: Junior became proficient in 3 weeks and later contributed significantly to the project."
        },
        {
            "question": "Describe a time when you had to work in a cross-functional team with non-technical members.",
            "intention": "Assess cross-functional collaboration",
            "answer": "Situation: Working with marketing team on a new landing page. Task: Translate design requirements into technical implementation. Action: Held regular sync meetings, used simple language to explain technical constraints, created prototypes for feedback. Result: Launched successfully with marketing team feeling involved and valued."
        },
        {
            "question": "Tell me about a time you had to take leadership on a project.",
            "intention": "Assess leadership skills",
            "answer": "Situation: Team lead was on leave during critical project phase. Task: Ensure project stayed on track. Action: Organized daily stand-ups, assigned tasks based on strengths, removed blockers, kept stakeholders informed. Result: Project delivered on time, team appreciated the guidance, and I was offered a leadership role later."
        },
        {
            "question": "Describe a situation where you had to give constructive feedback to a peer.",
            "intention": "Assess communication and feedback skills",
            "answer": "Situation: Peer's code had performance issues but they were defensive about feedback. Task: Address issue without creating conflict. Action: Scheduled one-on-one, started with positive observations, showed specific examples with data, suggested improvements collaboratively. Result: Peer accepted feedback, code improved, and our working relationship strengthened."
        },

        // Project Management & Deadlines (6)
        {
            "question": "Describe a situation where you had to prioritize multiple deadlines. How did you manage?",
            "intention": "Assess time management and prioritization skills",
            "answer": "Situation: Three features due same week with client demos scheduled. Task: Deliver all on time without compromising quality. Action: Created priority matrix based on urgency and importance, communicated with stakeholders about timelines, focused on MVP features first, and worked extra hours when necessary. Result: All features delivered, stakeholders appreciated the transparency, and we received positive client feedback."
        },
        {
            "question": "Tell me about a time you had to work under a tight deadline. How did you handle the pressure?",
            "intention": "Assess stress management and focus",
            "answer": "Situation: Client requested an urgent feature for a product demo the next day. Task: Deliver working feature in 24 hours. Action: Broke down the feature into smallest deliverable parts, focused on core functionality first, communicated progress hourly to stakeholders, and asked for help when stuck. Result: Delivered working feature on time, and it was a success in the demo."
        },
        {
            "question": "Describe a time when a project you were working on faced unexpected challenges.",
            "intention": "Assess problem-solving under pressure",
            "answer": "Situation: Third-party API we depended on was deprecated with 2 weeks notice. Task: Migrate to new API without disrupting users. Action: Quickly researched alternatives, created migration plan, implemented with feature flags for gradual rollout, added fallback mechanisms. Result: Successful migration completed before deadline with zero downtime."
        },
        {
            "question": "Tell me about a time you had to manage changing requirements.",
            "intention": "Assess adaptability and flexibility",
            "answer": "Situation: Client changed requirements midway through development. Task: Pivot without losing progress. Action: Analyzed impact, identified reusable components, communicated new timeline, and refactored code to be more modular. Result: Delivered on revised timeline, and the modular code made future changes easier."
        },
        {
            "question": "Describe a project you managed from start to finish. What was your approach?",
            "intention": "Assess project management skills",
            "answer": "Situation: Led development of customer dashboard. Task: Deliver on time with all requirements. Action: Broke project into sprints, used Agile methodology, held regular stand-ups, maintained backlog, tracked progress with Jira, communicated regularly with stakeholders. Result: Project delivered on time, under budget, with high customer satisfaction."
        },
        {
            "question": "How do you estimate time for development tasks? Give an example.",
            "intention": "Assess estimation and planning skills",
            "answer": "Break down tasks into smaller components, consider complexity and unknowns, add buffer for unexpected issues, reference similar past tasks, get input from team members. Example: Estimated 3 days for auth system, broke into: setup (0.5d), models (0.5d), endpoints (1d), testing (0.5d), documentation (0.5d)."
        },

        // Learning & Growth (6)
        {
            "question": "Describe a project where you had to learn a new technology quickly. How did you approach it?",
            "intention": "Assess learning agility and adaptability",
            "answer": "Situation: Needed to implement real-time features using Socket.io which I hadn't used before. Task: Add live chat functionality within 2 weeks. Action: Spent first weekend on tutorials and documentation, built a small prototype, asked for code reviews from experienced developers, and gradually integrated into production. Result: Successfully implemented with production-ready code, and later mentored other team members on the same technology."
        },
        {
            "question": "Tell me about a time you received critical feedback. How did you respond?",
            "intention": "Assess receptiveness to feedback and growth mindset",
            "answer": "Situation: Senior developer pointed out that my code lacked proper error handling during code review. Task: Improve code quality and learn best practices. Action: Thanked them for the feedback, researched error handling patterns, refactored the code with try-catch blocks and custom error classes, and added logging. Result: Code became more robust, and I started proactively including error handling in all my future work."
        },
        {
            "question": "Tell me about a time you failed. What did you learn?",
            "intention": "Assess resilience and learning from failure",
            "answer": "Situation: Implemented a feature without proper testing that broke in production. Task: Fix and prevent recurrence. Action: Took responsibility, fixed immediately, added comprehensive tests, and implemented CI/CD pipeline with automated testing. Result: No similar issues since, and I became an advocate for test-driven development in the team."
        },
        {
            "question": "How do you stay updated with the latest technologies in your field?",
            "intention": "Assess commitment to continuous learning",
            "answer": "Follow tech blogs (Medium, Dev.to), subscribe to newsletters (JavaScript Weekly), participate in GitHub discussions, attend webinars and conferences, contribute to open source, take online courses, experiment with new technologies in side projects, and share learnings with team."
        },
        {
            "question": "Describe a time you had to learn from a mistake. What changed?",
            "intention": "Assess learning from experience",
            "answer": "Situation: Deployed code without proper error handling that caused user frustration. Task: Improve and prevent. Action: Added comprehensive error handling, implemented logging, created monitoring alerts, and shared learnings with team in knowledge-sharing session. Result: Fewer production issues, team adopted better practices."
        },
        {
            "question": "Tell me about a technical challenge you overcame through self-learning.",
            "intention": "Assess self-directed learning",
            "answer": "Situation: Needed to implement complex animations but had no experience. Task: Deliver smooth animations. Action: Researched libraries (Framer Motion), took online course, built prototypes, optimized performance. Result: Animations were praised by users, and I became go-to person for animation questions."
        },

        // Problem Solving & Initiative (6)
        {
            "question": "Tell me about a time you went above and beyond for a project.",
            "intention": "Assess initiative and dedication",
            "answer": "Situation: Noticed our application's performance was degrading under load. Task: Improve performance before it affected users. Action: Spent weekend profiling the application, identified N+1 queries, optimized database indexes, implemented caching with Redis. Result: Response times improved by 60%, and we handled peak traffic without issues."
        },
        {
            "question": "Describe a time when you had to make a decision with incomplete information.",
            "intention": "Assess decision-making under uncertainty",
            "answer": "Situation: Needed to choose a third-party API for payment processing with limited time for evaluation. Task: Make the best choice quickly. Action: Listed critical requirements, researched top options, created comparison matrix, tested with sandbox environments, and consulted with team. Result: Chose Stripe which worked well, and we later added redundancy with another provider."
        },
        {
            "question": "Tell me about a complex problem you solved. Walk me through your approach.",
            "intention": "Assess problem-solving methodology",
            "answer": "Situation: Database queries were timing out under load. Task: Identify and fix root cause. Action: Used profiling tools to identify slow queries, analyzed execution plans, added appropriate indexes, implemented query optimization, added caching layer. Result: Query times reduced from 5s to 200ms, system stable under peak load."
        },
        {
            "question": "Describe a time you identified and fixed a bug that others missed.",
            "intention": "Assess debugging skills and attention to detail",
            "answer": "Situation: Intermittent error in production that team couldn't reproduce. Task: Find and fix elusive bug. Action: Added detailed logging, analyzed patterns, found race condition in async code, reproduced locally with specific timing, fixed with proper synchronization. Result: Bug eliminated, system more reliable."
        },
        {
            "question": "Tell me about a time you improved an existing process or system.",
            "intention": "Assess process improvement mindset",
            "answer": "Situation: Deployment process was manual and error-prone. Task: Automate and improve. Action: Researched CI/CD options, implemented GitHub Actions, created automated tests, added deployment checks, documented new process. Result: Deployment time reduced from 2 hours to 15 minutes, zero deployment errors since."
        },
        {
            "question": "Describe a situation where you had to think creatively to solve a problem.",
            "intention": "Assess creativity and innovation",
            "answer": "Situation: Needed to implement search with limited backend support. Task: Create functional search. Action: Used Elasticsearch on frontend with pre-indexed data, implemented fuzzy matching, added filters and facets, optimized with debouncing. Result: Search worked well, users found what they needed quickly."
        },

        // Communication & Stakeholder Management (6)
        {
            "question": "Describe a time when you had to explain a technical concept to a non-technical stakeholder.",
            "intention": "Assess communication and simplification skills",
            "answer": "Situation: Needed to explain why a feature would take longer than expected due to technical debt. Task: Get approval for additional time. Action: Used analogies like renovating a house while living in it, created simple diagrams showing current vs desired architecture, and focused on business benefits. Result: Stakeholder understood the need and approved the timeline, and we delivered a more maintainable solution."
        },
        {
            "question": "Tell me about a time you had to persuade someone to adopt your idea.",
            "intention": "Assess persuasion and influence skills",
            "answer": "Situation: Team was considering a complex framework that would increase learning curve. Task: Propose simpler alternative. Action: Researched both options, built prototypes to compare, presented findings with metrics, and addressed concerns. Result: Team agreed to use simpler solution, project completed faster, and new developers onboarded easily."
        },
        {
            "question": "Describe a time you had to communicate bad news to stakeholders.",
            "intention": "Assess honesty and communication under pressure",
            "answer": "Situation: Feature was behind schedule due to technical challenges. Task: Communicate delay professionally. Action: Prepared analysis of challenges, proposed revised timeline with buffer, presented options for partial delivery, took responsibility. Result: Stakeholder appreciated honesty, agreed to revised timeline, and we delivered successfully."
        },
        {
            "question": "How do you handle situations when you don't know the answer?",
            "intention": "Assess honesty and resourcefulness",
            "answer": "I'm honest about not knowing, but proactive about finding answers. Example: During a technical discussion about a new technology, I admitted unfamiliarity but offered to research and follow up. I spent time learning, documented findings, and shared with the team, turning it into a learning opportunity."
        },
        {
            "question": "Tell me about a time you had to document your work for others.",
            "intention": "Assess documentation and knowledge sharing",
            "answer": "Situation: Built complex feature that others would need to maintain. Task: Create comprehensive documentation. Action: Wrote technical documentation with architecture diagrams, API specs, setup instructions, troubleshooting guide, and examples. Added inline comments in code. Result: Team could maintain feature easily, onboarding time reduced."
        },
        {
            "question": "Describe a situation where you had to present to a large audience.",
            "intention": "Assess presentation skills",
            "answer": "Situation: Asked to present project demo to 50+ people including executives. Task: Deliver clear, engaging presentation. Action: Prepared slides with visuals, practiced multiple times, anticipated questions, focused on business value. Result: Presentation well-received, project got additional funding."
        }
    ];

    const combined = [...existingQuestions, ...defaultBehavioralQuestions];
    return combined.slice(0, targetCount);
}

/**
 * @description Default report when AI fails
 */
function getDefaultInterviewReport() {
    return {
        "matchScore": 85,
        "title": "MERN Stack Developer",
        "skillGaps": [
            { "skill": "Cloud Deployment & DevOps", "severity": "high" },
            { "skill": "Advanced State Management", "severity": "medium" },
            { "skill": "Testing (Jest/Cypress)", "severity": "medium" },
            { "skill": "System Design", "severity": "low" },
            { "skill": "TypeScript", "severity": "medium" },
            { "skill": "GraphQL", "severity": "low" }
        ],
        "technicalQuestions": padTechnicalQuestions([], 30),
        "behavioralQuestions": padBehavioralQuestions([], 30),
        "preparationPlan": [
            {
                "day": 1,
                "focus": "MongoDB & Database Design",
                "tasks": [
                    "Review indexing strategies and aggregation pipeline",
                    "Practice designing schemas for different scenarios",
                    "Complete 10 LeetCode database problems"
                ]
            },
            {
                "day": 2,
                "focus": "Express.js & API Design",
                "tasks": [
                    "Review middleware concepts and error handling",
                    "Practice building RESTful APIs with proper status codes",
                    "Implement authentication with JWT"
                ]
            },
            {
                "day": 3,
                "focus": "React & Performance",
                "tasks": [
                    "Review hooks in depth (useEffect, useMemo, useCallback)",
                    "Practice component optimization techniques",
                    "Build a small app with lazy loading and code splitting"
                ]
            },
            {
                "day": 4,
                "focus": "Node.js & Asynchronous Patterns",
                "tasks": [
                    "Review event loop and async/await patterns",
                    "Practice error handling and debugging",
                    "Implement worker threads for CPU-intensive tasks"
                ]
            },
            {
                "day": 5,
                "focus": "Data Structures & Algorithms",
                "tasks": [
                    "Review arrays, linked lists, trees, graphs",
                    "Practice 5 medium LeetCode problems",
                    "Understand time and space complexity analysis"
                ]
            },
            {
                "day": 6,
                "focus": "System Design",
                "tasks": [
                    "Study design patterns (Singleton, Factory, Observer)",
                    "Practice designing URL shortener or chat system",
                    "Learn about load balancing, caching, and CDNs"
                ]
            },
            {
                "day": 7,
                "focus": "Security Best Practices",
                "tasks": [
                    "Review OWASP top 10 vulnerabilities",
                    "Implement security headers with Helmet.js",
                    "Practice secure authentication flows"
                ]
            },
            {
                "day": 8,
                "focus": "Testing & Quality Assurance",
                "tasks": [
                    "Learn Jest for unit testing",
                    "Practice integration testing with Supertest",
                    "Implement E2E tests with Cypress"
                ]
            },
            {
                "day": 9,
                "focus": "DevOps & Deployment",
                "tasks": [
                    "Learn Docker containerization",
                    "Practice deploying to AWS/Azure",
                    "Set up CI/CD pipeline with GitHub Actions"
                ]
            },
            {
                "day": 10,
                "focus": "Mock Interviews & Review",
                "tasks": [
                    "Practice with peer mock interviews",
                    "Review all weak areas identified",
                    "Prepare questions for the interviewer"
                ]
            }
        ]
    };
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        const resumePdfSchema = z.object({
            html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
        })

        const prompt = `Generate resume for a candidate with the following details:
                            Resume: ${resume}
                            Self Description: ${selfDescription}
                            Job Description: ${jobDescription}

                            the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                            The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                            The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                            you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                            The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                            The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                        `

        console.log("📄 Generating optimized resume PDF...");

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        });

        const jsonContent = JSON.parse(response.text)
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

        console.log("✅ PDF generated successfully, size:", pdfBuffer.length, "bytes");

        return pdfBuffer

    } catch (error) {
        console.error("❌ Error in generateResumePdf:", error);
        return Buffer.from("Error generating resume PDF");
    }
}

module.exports = { generateInterviewReport, generateResumePdf }