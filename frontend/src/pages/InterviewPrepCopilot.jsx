import React, { useState } from 'react';
import {
  Brain, Target, CheckCircle2, ChevronDown, ChevronUp,
  MessageSquare, Sparkles, Users, Code2, Settings, Star,
  BookOpen, Lightbulb,
} from 'lucide-react';

const ROUND_TYPES = [
  { id: 'HR', label: 'HR Screening', icon: Users, color: 'blue' },
  { id: 'TECH', label: 'Technical Coding', icon: Code2, color: 'emerald' },
  { id: 'SYSTEM', label: 'System Design', icon: Settings, color: 'purple' },
  { id: 'STAR', label: 'Behavioral (STAR)', icon: Star, color: 'amber' },
];

const QUESTIONS_DB = {
  HR: [
    {
      q: 'Tell me about yourself.',
      hints: ['Start with current role & years of experience', 'Mention 2-3 biggest technical accomplishments', 'Connect your background to why you want this role', 'Keep it to 90-120 seconds'],
      model: 'I\'m a software engineer with [X years] of experience specializing in [tech stack]. Most recently at [Company], I [key accomplishment]. I\'m particularly proud of [specific project] where I [impact]. I\'m excited about this role because [specific reason related to company/tech].',
    },
    {
      q: 'Why are you looking for a new opportunity?',
      hints: ['Keep it positive — never badmouth current employer', 'Focus on growth, learning, or new challenge', 'Connect to what this company specifically offers', 'Be honest but professional'],
      model: 'I\'ve really enjoyed my time at [Company] and learned a lot, but I\'m ready for a bigger challenge. I\'m particularly excited about [Company]\'s work on [specific product/tech] and the opportunity to [specific growth area]. I think this role aligns perfectly with where I want to take my career.',
    },
    {
      q: 'What are your salary expectations?',
      hints: ['Research market rate on Glassdoor/Levels.fyi before interview', 'Give a range, not a single number', 'Anchor slightly higher to leave room for negotiation', 'You can also ask what the budget is first'],
      model: 'Based on my research and my [X years] of experience with [relevant skills], I\'m targeting a range of $[X]–$[Y]. That said, I\'m open to discussing the full compensation package including equity, benefits, and growth opportunities. What is the budgeted range for this role?',
    },
    {
      q: 'Where do you see yourself in 5 years?',
      hints: ['Show ambition but also commitment to the role', 'Mention technical leadership or architecture skills', 'Connect your goals to what this company can offer', 'Be specific about tech, not just titles'],
      model: 'In 5 years, I\'d like to have grown into a [Staff/Principal/Lead] engineer role where I\'m making architectural decisions and mentoring junior engineers. I\'m particularly interested in deepening my expertise in [relevant area]. I see [Company]\'s investment in [tech/domain] as a great place to develop those skills.',
    },
    {
      q: 'What\'s your biggest strength and weakness?',
      hints: ['Strength: Pick one highly relevant to the job, give a specific example', 'Weakness: Be genuine but choose something you\'ve actively improved', 'Show self-awareness and a growth mindset', 'Avoid clichés like "I work too hard"'],
      model: 'Strength: My biggest strength is [specific skill]. For example, at [Company] I [specific example with result].\n\nWeakness: I\'ve historically struggled with [genuine weakness]. I recognized this when [situation]. Since then, I\'ve [specific steps taken to improve], and I\'ve seen improvement in [measurable outcome].',
    },
    {
      q: 'Why do you want to work at [Company]?',
      hints: ['Research the company thoroughly: products, tech blog, engineering culture', 'Mention 1-2 specific products/initiatives you admire', 'Connect to your own career goals and values', 'Show you\'ve done your homework — be specific'],
      model: 'I\'ve been following [Company] for [time period] and I\'m genuinely excited about [specific product/initiative]. What really stands out to me is [specific technical challenge or company value]. I also read [recent blog post/talk] about your work on [topic], and that\'s exactly the kind of problem I want to be working on.',
    },
  ],
  TECH: [
    {
      q: 'Explain the JavaScript event loop (or JVM memory model for Java).',
      hints: ['JS: Call Stack → Web APIs → Callback Queue → Microtask Queue → Event Loop', 'Mention Promise resolution vs setTimeout ordering', 'JVM: Heap (Young/Old gen), Stack, Method Area, GC algorithms', 'Be ready to explain with a code example'],
      model: 'The event loop continuously checks if the call stack is empty. When it is, it processes microtasks (Promise callbacks) first, then macrotasks (setTimeout, setInterval). This is why Promise.resolve().then() executes before setTimeout(..., 0). The Web APIs handle async operations and push callbacks to the appropriate queue.',
    },
    {
      q: 'What is time/space complexity? Walk me through solving the Two Sum problem.',
      hints: ['Explain Big O notation clearly: O(1) < O(log n) < O(n) < O(n log n) < O(n²)', 'Two Sum brute force: O(n²) time, O(1) space', 'Two Sum optimal: O(n) time using a HashMap, O(n) space', 'Talk through your thinking before coding'],
      model: 'Time complexity measures how runtime grows with input size. For Two Sum, I\'d use a HashMap: iterate once, storing each element\'s value→index. For each number, check if (target - current) exists in the map. This gives O(n) time and O(n) space, much better than the O(n²) brute force approach.',
    },
    {
      q: 'Explain the difference between SQL and NoSQL databases.',
      hints: ['SQL: ACID, schema-based, joins, vertical scaling, relational', 'NoSQL: eventual consistency (usually), flexible schema, horizontal scaling', 'Types of NoSQL: Document (MongoDB), Key-Value (Redis), Column (Cassandra), Graph (Neo4j)', 'When to use each: ACID transactions vs high-scale read-heavy workloads'],
      model: 'SQL databases like PostgreSQL enforce ACID properties with a fixed schema and support complex JOINs — ideal for transactional systems. NoSQL databases like MongoDB sacrifice some consistency for horizontal scalability and flexible schemas — ideal for high-volume, read-heavy workloads or semi-structured data. The choice depends on consistency requirements, scale, and query patterns.',
    },
    {
      q: 'What is a RESTful API? What are the most important HTTP status codes?',
      hints: ['REST principles: Stateless, Uniform Interface, Client-Server, Cacheable', 'HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE', 'Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error', 'Idempotency: GET, PUT, DELETE are idempotent; POST is not'],
      model: 'REST is an architectural style for APIs using HTTP. Key principles: stateless requests, uniform interface using HTTP verbs (GET/POST/PUT/DELETE), resource-based URLs. Critical status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthenticated), 403 (Unauthorized), 404 (Not Found), 422 (Validation Error), 429 (Rate Limited), 500 (Server Error).',
    },
    {
      q: 'Explain React hooks — useState, useEffect, useMemo, useCallback.',
      hints: ['useState: local component state management', 'useEffect: side effects, lifecycle equivalent (mount/update/unmount)', 'useMemo: memoize expensive computed values', 'useCallback: memoize function references to prevent unnecessary re-renders', 'Rules of hooks: only call at top level, only in functional components'],
      model: 'useState manages local state. useEffect handles side effects like API calls or subscriptions — the dependency array controls when it re-runs. useMemo memoizes expensive computed values so they only recalculate when dependencies change. useCallback memoizes function references, preventing unnecessary child re-renders when passing callbacks as props.',
    },
    {
      q: 'Design a function to reverse a linked list iteratively and recursively.',
      hints: ['Iterative: use 3 pointers (prev, curr, next) in a single pass — O(n) time, O(1) space', 'Recursive: reverse rest of list, then fix head pointer — O(n) time, O(n) stack space', 'Talk through edge cases: null list, single node', 'Always trace through an example before presenting solution'],
      model: 'Iterative: Initialize prev=null, curr=head. Loop: save next=curr.next, set curr.next=prev, advance prev=curr, curr=next. Return prev.\n\nRecursive: Base case if head==null or head.next==null return head. Recurse on head.next to get newHead. Set head.next.next=head, head.next=null. Return newHead.',
    },
  ],
  SYSTEM: [
    {
      q: 'Design a URL shortener (like bit.ly).',
      hints: ['Requirements: shorten URLs, redirect, analytics, custom aliases', 'Scale: ~100M URLs, ~10B redirects/day (read-heavy)', 'Core: base62 encoding of auto-increment ID or hash', 'Storage: relational DB for URL mapping, CDN/cache for hot URLs, Redis for rate limiting'],
      star: { situation: 'Requirements & Scale', task: 'High-level Design', action: 'Deep Dive Components', result: 'Trade-offs & Bottlenecks' },
      model: 'Start with requirements: functional (create short URL, redirect, optional custom alias, analytics) and non-functional (low latency <10ms redirect, high availability 99.99%, ~100M URLs stored).\n\nScale estimation: 1000 writes/sec, 100K reads/sec (read-heavy 100:1 ratio).\n\nHigh-level design: Client → Load Balancer → URL Service → DB + Cache. Use base62(auto-increment-id) for short URLs.\n\nDeep dive: Use Redis for caching hot URLs (80/20 rule). DB: write to primary, read replicas for redirects. Analytics: async via message queue (Kafka).',
    },
    {
      q: 'Design Twitter\'s home timeline feed.',
      hints: ['Fan-out on write (push model) vs fan-out on read (pull model)', 'Hybrid: push for regular users, pull for celebrities (high follower count)', 'Storage: timeline cache in Redis, media in S3/CDN', 'Ranking: ML model scores tweets by relevance + recency'],
      star: { situation: 'Requirements', task: 'Data Model', action: 'Feed Generation', result: 'Scaling & Trade-offs' },
      model: 'Two approaches: Pull (compute feed at read time — simple but slow for large follow graphs) vs Push (pre-compute feed at write time via fanout — fast reads but expensive writes).\n\nHybrid approach: For users with <10K followers, fan-out on write to followers\' Redis timeline caches. For celebrities (>10K followers), fetch separately at read time and merge. This balances write amplification vs read latency.',
    },
    {
      q: 'How would you design a rate limiter?',
      hints: ['Algorithms: Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, Sliding Window Counter', 'Sliding Window Counter is most practical: accurate + memory efficient', 'Storage: Redis with atomic operations (INCR + EXPIRE or Lua scripts)', 'Distributed: Redis cluster for shared state across multiple servers'],
      star: { situation: 'Requirements', task: 'Algorithm Choice', action: 'Implementation', result: 'Distributed Approach' },
      model: 'Rate limiter sits between client and server (API gateway or middleware). I\'d use the Sliding Window Counter algorithm: for each user, store a counter in Redis with a TTL equal to the window. On each request, INCR the counter and check if > limit. If at window boundary, use a weighted sum of current and previous windows.\n\nFor distributed systems: use Redis with Lua scripts for atomicity. For extreme scale, use local in-memory counters with periodic sync to Redis.',
    },
    {
      q: 'Design a caching layer for high read traffic (e.g., e-commerce product catalog).',
      hints: ['Cache-aside (lazy loading) vs Write-through vs Write-behind', 'Cache eviction policies: LRU, LFU, TTL-based', 'Cache invalidation: hardest problem — event-driven invalidation vs TTL expiry', 'Multi-level caching: CDN (edge) → Application Cache (Redis) → DB Read Replicas'],
      star: { situation: 'Scale Requirements', task: 'Cache Strategy', action: 'Implementation', result: 'Consistency Trade-offs' },
      model: 'Multi-level caching: CDN for static assets/product images, Redis for product catalog data (TTL-based), local in-memory for ultra-hot items.\n\nUse cache-aside pattern: try cache first, on miss fetch DB and populate cache. For writes, invalidate cache entries immediately (write-through). Handle thundering herd with mutex/lock on cache miss to prevent stampede. Use consistent hashing for Redis cluster distribution.',
    },
    {
      q: 'Design a distributed message queue (like Kafka).',
      hints: ['Key concepts: Topics, Partitions, Consumer Groups, Offsets', 'At-least-once vs exactly-once delivery semantics', 'Persistence: write to disk sequentially (fast!) with log segments', 'Scaling: partition count limits parallelism; more partitions = more throughput'],
      star: { situation: 'Requirements', task: 'Data Model', action: 'Producer/Consumer', result: 'Fault Tolerance' },
      model: 'Messages are organized into Topics, each split into Partitions for parallelism. Producers write to partition leader (chosen by partition key hash). Consumers in a Consumer Group each own exclusive partitions — offset tracking ensures each message is processed once per group.\n\nStorage: append-only log files on disk (sequential writes are fast). Replication: each partition has N replicas with one leader. Fault tolerance via ISR (In-Sync Replicas) — producer acks from all ISR replicas before committing.',
    },
    {
      q: 'How does consistent hashing work and when would you use it?',
      hints: ['Problem: when you add/remove nodes from a hash ring, minimal key remapping', 'Place nodes on a virtual hash ring (0 to 2^32)', 'Each key maps clockwise to nearest node', 'Virtual nodes: each physical node occupies multiple points for better balance'],
      star: { situation: 'Problem Statement', task: 'Algorithm', action: 'Implementation', result: 'Use Cases' },
      model: 'Problem: Naive modulo hashing (key % n_nodes) requires remapping all keys when node count changes.\n\nConsistent hashing places both nodes and keys on a circular hash ring. A key maps to the nearest node clockwise. When a node is added/removed, only keys between it and the previous node are remapped — on average only K/n keys instead of all K keys.\n\nVirtual nodes: each physical node gets multiple positions on the ring for better load distribution. Used in: Cassandra, DynamoDB, Redis Cluster, CDN routing.',
    },
  ],
  STAR: [
    {
      q: 'Tell me about a time you handled a conflict in your team.',
      star: { situation: 'Describe the team situation and the conflict', task: 'What was your responsibility in resolving it?', action: 'Specific steps you took — conversations, compromises, escalations', result: 'How it was resolved and what you learned' },
      hints: ['Focus on constructive resolution, not blame', 'Show empathy and active listening skills', 'Emphasize data/logic over emotion in technical disagreements', 'End with a positive outcome or lesson'],
      model: 'S: On my team at [Company], we had a disagreement between two engineers about the database schema design for our new feature.\nT: As the tech lead, it was my responsibility to facilitate a resolution before it blocked sprint progress.\nA: I scheduled a 30-min whiteboard session, asked each engineer to present their approach with trade-offs, then led a discussion using our scale requirements as the evaluation criteria. I proposed a hybrid approach that addressed both concerns.\nR: We reached consensus in one session, merged the implementation on time, and the schema has scaled to 50M records without issues. The engineers reported feeling more heard after that process.',
    },
    {
      q: 'Describe a project you are most proud of.',
      star: { situation: 'What was the context, team size, timeline?', task: 'What was your specific role and ownership?', action: 'What technical decisions did you make? How did you execute?', result: 'What was the measurable impact?' },
      hints: ['Pick a project with clear, quantifiable impact', 'Highlight your specific contributions, not the team\'s', 'Mention technical challenges and how you overcame them', 'Use numbers: latency reduction %, users served, cost savings'],
      model: 'S: At [Company], we had a critical performance problem — our API response times were 3-4 seconds which was causing 25% cart abandonment.\nT: I was the lead engineer tasked with reducing latency to under 500ms within 6 weeks.\nA: I profiled the hot path, identified N+1 database queries, implemented Redis caching for product catalog, and added a CDN for static assets. I also introduced database query optimization and read replicas.\nR: We reduced p99 latency from 3.8s to 340ms — a 91% improvement. Cart abandonment dropped by 18%, generating an estimated $2M in additional annual revenue.',
    },
    {
      q: 'Tell me about a time you missed a deadline.',
      star: { situation: 'What was the project and what caused the delay?', task: 'What were the expectations and your role?', action: 'How did you communicate? What did you do to recover?', result: 'What was the outcome and what did you change?' },
      hints: ['Be honest — everyone misses deadlines sometimes', 'Show proactive communication — did you give early warning?', 'Demonstrate accountability without making excuses', 'Focus on what you learned and changed going forward'],
      model: 'S: We were building a payment integration that was scheduled for Q3 release. I underestimated the complexity of the third-party API.\nT: I was responsible for the backend integration and had committed to a 4-week timeline.\nA: By week 3, I realized we needed 2 more weeks. I immediately escalated to my manager, communicated clearly to stakeholders about the revised timeline and the risks of rushing, and proposed descoping one minor feature to meet a partial deadline.\nR: We shipped the core feature 10 days late but with zero bugs in production. I learned to add 20% buffer for third-party integrations and to raise risks early rather than hoping to catch up.',
    },
    {
      q: 'Describe how you handled a technical disagreement with a colleague.',
      star: { situation: 'What was the technical question at stake?', task: 'What was your position and why?', action: 'How did you engage with the disagreement?', result: 'How was it resolved? Was the best technical decision made?' },
      hints: ['Show you can disagree respectfully and data-driven', '"Disagree and commit" is a valued trait — mention it', 'Demonstrate intellectual humility if you were wrong', 'Show you prioritize the team\'s outcome over being right'],
      model: 'S: My colleague wanted to use MongoDB for our new reporting service; I felt PostgreSQL with JSONB was better for our use case.\nT: I had to make a recommendation to the team that would affect long-term maintainability.\nA: Instead of just asserting my view, I proposed a benchmark — we built a small prototype with both options and tested with realistic query patterns. I also wrote a short RFC documenting both approaches\' trade-offs.\nR: The data showed PostgreSQL was 3x faster for our analytical queries. My colleague agreed after seeing the results. We went with PostgreSQL and the reporting service has performed excellently. This process also became our standard for future tech decisions.',
    },
    {
      q: 'Tell me about a time you took initiative without being asked.',
      star: { situation: 'What problem did you notice that others hadn\'t addressed?', task: 'What did you decide to do and why?', action: 'What specific steps did you take on your own?', result: 'What was the impact of your initiative?' },
      hints: ['Show ownership and proactiveness', 'Highlight impact that went beyond your role description', 'Show it aligned with business goals, not just personal interest', 'Demonstrate you can identify and prioritize without being directed'],
      model: 'S: I noticed our team\'s local dev setup took 45+ minutes for new engineers, causing slow onboarding.\nT: This wasn\'t my assigned work, but I saw it as a team velocity problem I could solve.\nA: Over 2 weekends, I automated the setup with a shell script + Docker Compose, wrote comprehensive documentation, and recorded a 10-minute video walkthrough. I got feedback from 3 recent joiners and iterated.\nR: New engineer setup time went from 45+ minutes to under 8 minutes. Our next 4 new hires got productive same-day. My manager included this in my performance review as evidence of leadership.',
    },
    {
      q: 'Describe a situation where you had to learn something quickly.',
      star: { situation: 'What new skill or technology did you need to learn?', task: 'What was the timeline and stakes?', action: 'How specifically did you approach learning?', result: 'What was the outcome?' },
      hints: ['Show your learning methodology, not just that you learned', 'Mention specific resources: docs, courses, mentors, hands-on projects', 'Highlight what you prioritized given time constraints', 'Demonstrate you can apply learning under pressure'],
      model: 'S: We won a contract that required building on AWS infrastructure — I had only used GCP before and needed to learn AWS within 3 weeks.\nT: I was responsible for the infrastructure setup, which was on the critical path for the project.\nA: I got AWS Certified Solutions Architect study materials, spent evenings on hands-on labs in a sandbox account, and set up 1:1s with our AWS specialist twice a week. I prioritized the specific services we needed (EC2, RDS, S3, IAM) over trying to learn everything.\nR: I had the infrastructure ready in 2.5 weeks, under deadline. I later passed the AWS SAA certification, and I\'m now the team\'s AWS resource for future projects.',
    },
  ],
};

const QUESTIONS_TO_ASK = {
  HR: [
    'What does the onboarding process look like for engineers?',
    'How is performance evaluated and how often are reviews done?',
    'What does the engineering culture look like day-to-day?',
    'What are the biggest challenges the team is facing right now?',
    'What does success look like in this role after 90 days?',
  ],
  TECH: [
    'What is the current tech stack, and are there plans to evolve it?',
    'How does the team approach technical debt and code quality?',
    'What does the code review process look like?',
    'How much time do engineers spend on new features vs. maintenance?',
    'What testing practices does the team follow?',
  ],
  SYSTEM: [
    'What are the biggest scale challenges the team is working on?',
    'How does the team make architectural decisions? Is there an RFC process?',
    'What is the incident response process like?',
    'How much autonomy do senior engineers have in system design?',
    'What parts of the infrastructure are you most proud of?',
  ],
  STAR: [
    'How does the team handle disagreements or conflicting priorities?',
    'What qualities do the most successful engineers on this team share?',
    'How does the team support professional growth and career development?',
    'What is the biggest lesson the team learned in the past year?',
    'How collaborative is the work — is it mostly individual or pair programming?',
  ],
};

function evaluateAnswer(answer, roundType) {
  const lower = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const starKeywords = ['situation', 'task', 'action', 'result', 'impact', 'outcome', 'led', 'built', 'delivered', 'achieved', 'reduced', 'increased', 'improved', 'learned'];
  const starHits = starKeywords.filter(k => lower.includes(k)).length;
  const hasNumbers = /\d+%|\d+x|\d+ (users|engineers|teams|months|weeks)|\$\d+/i.test(answer);

  const lengthScore = wordCount < 30 ? 20 : wordCount < 75 ? 50 : wordCount < 150 ? 75 : wordCount < 300 ? 90 : 85;
  const starScore = roundType === 'STAR' ? Math.min(100, starHits * 14) : 80;
  const metricsScore = hasNumbers ? 100 : 40;
  const overall = Math.round(lengthScore * 0.4 + starScore * 0.35 + metricsScore * 0.25);

  const feedback = [];
  if (wordCount < 75) feedback.push('Your answer is brief — aim for 100-200 words with specific details');
  if (roundType === 'STAR' && starHits < 3) feedback.push('Include clear STAR components: set up the Situation, your Task, the Actions you took, and the Result');
  if (!hasNumbers) feedback.push('Add quantifiable metrics: "reduced by 40%", "team of 6", "3-week timeline"');
  if (wordCount >= 75 && starHits >= 3) feedback.push('Great structure! Make sure to emphasize YOUR specific contributions vs. the team\'s');
  if (overall >= 80) feedback.push('Strong answer overall. Practice delivering it conversationally in 90-120 seconds.');

  return { overall, lengthScore, starScore: roundType === 'STAR' ? starScore : null, metricsScore, wordCount, feedback };
}

const ROUND_COLOR = { HR: 'blue', TECH: 'emerald', SYSTEM: 'purple', STAR: 'amber' };
const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', active: 'bg-blue-600 text-white' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', active: 'bg-emerald-600 text-white' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', active: 'bg-purple-600 text-white' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', active: 'bg-amber-600 text-white' },
};

const QuestionCard = ({ question, index, roundType }) => {
  const [expanded, setExpanded] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const color = ROUND_COLOR[roundType];
  const cc = COLOR_CLASSES[color];

  const handleEvaluate = () => {
    if (!practiceAnswer.trim()) return;
    setEvaluation(evaluateAnswer(practiceAnswer, roundType));
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4">
      <div className="flex items-start gap-3">
        <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${cc.bg} ${cc.text} mt-0.5`}>{index + 1}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white leading-snug">{question.q}</p>
          <button onClick={() => setExpanded(!expanded)} className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${cc.text} hover:opacity-80 transition`}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide Guide' : 'Show Guide & Model Answer'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ml-10 space-y-3">
          {question.star && (
            <div className={`p-3.5 rounded-xl ${cc.bg} border ${cc.border}`}>
              <p className={`text-xs font-bold ${cc.text} mb-2`}>📐 Framework to Cover</p>
              <div className="space-y-1">
                {Object.entries(question.star).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className={`font-bold ${cc.text} w-16 flex-shrink-0`}>{k.charAt(0).toUpperCase() + k.slice(1)}:</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Key Points to Address</p>
            <ul className="space-y-1">
              {question.hints.map((hint, i) => (
                <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-amber-400 flex-shrink-0">•</span>{hint}</li>
              ))}
            </ul>
          </div>

          {question.model && (
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Model Answer Template</p>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{question.model}</p>
            </div>
          )}
        </div>
      )}

      <div className="ml-10 space-y-2">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Practice Your Answer
        </label>
        <textarea value={practiceAnswer} onChange={e => setPracticeAnswer(e.target.value)}
          placeholder="Type your answer here to get AI feedback on clarity, structure, and STAR format..."
          rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-600 p-3 focus:outline-none focus:border-purple-500 resize-none transition" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{practiceAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
          <button onClick={handleEvaluate} disabled={!practiceAnswer.trim()}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed ${cc.bg} ${cc.text} border ${cc.border} hover:opacity-80`}>
            <Sparkles className="w-3.5 h-3.5" /> Evaluate Answer
          </button>
        </div>

        {evaluation && (
          <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" /> Answer Score</p>
              <span className={`text-lg font-extrabold ${evaluation.overall >= 80 ? 'text-emerald-400' : evaluation.overall >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{evaluation.overall}/100</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-slate-900">
                <p className="text-xs font-bold text-blue-400">{evaluation.lengthScore}%</p>
                <p className="text-[10px] text-slate-500">Depth</p>
              </div>
              {evaluation.starScore !== null && (
                <div className="text-center p-2 rounded-lg bg-slate-900">
                  <p className="text-xs font-bold text-purple-400">{evaluation.starScore}%</p>
                  <p className="text-[10px] text-slate-500">STAR Structure</p>
                </div>
              )}
              <div className="text-center p-2 rounded-lg bg-slate-900">
                <p className="text-xs font-bold text-amber-400">{evaluation.metricsScore}%</p>
                <p className="text-[10px] text-slate-500">Metrics</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {evaluation.feedback.map((fb, i) => (
                <p key={i} className="text-[11px] text-slate-300 flex gap-2"><span className={evaluation.overall >= 80 ? 'text-emerald-400' : 'text-amber-400'}>→</span>{fb}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const InterviewPrepCopilot = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [roundType, setRoundType] = useState('HR');

  const questions = QUESTIONS_DB[roundType] || [];
  const questionsToAsk = QUESTIONS_TO_ASK[roundType] || [];
  const cc = COLOR_CLASSES[ROUND_COLOR[roundType]];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </span>
          AI Interview Prep Copilot
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">AI</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Role-specific questions, model answers, STAR frameworks, and an AI answer grader.</p>
      </div>

      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe, Startup..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 px-3.5 py-2.5 focus:outline-none focus:border-purple-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 px-3.5 py-2.5 focus:outline-none focus:border-purple-500 transition" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2">Interview Round</label>
          <div className="flex flex-wrap gap-2">
            {ROUND_TYPES.map(rt => {
              const RtIcon = rt.icon;
              const rtcc = COLOR_CLASSES[rt.color];
              const isActive = roundType === rt.id;
              return (
                <button key={rt.id} onClick={() => setRoundType(rt.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition border ${isActive ? `${rtcc.active} border-transparent shadow-lg` : `${rtcc.bg} ${rtcc.text} ${rtcc.border} hover:opacity-80`}`}>
                  <RtIcon className="w-3.5 h-3.5" />
                  {rt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {company && (
        <div className={`px-4 py-3 rounded-2xl ${cc.bg} border ${cc.border} flex items-center gap-2.5`}>
          <Target className={`w-4 h-4 ${cc.text}`} />
          <p className="text-xs text-slate-300">
            Preparing for <span className={`font-bold ${cc.text}`}>{ROUND_TYPES.find(r => r.id === roundType)?.label}</span> interview
            {company && <> at <span className="font-bold text-white">{company}</span></>}
            {role && <> for <span className="font-bold text-white">{role}</span></>}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 ${cc.text}`} />
          {ROUND_TYPES.find(r => r.id === roundType)?.label} Questions
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${cc.bg} ${cc.text} border ${cc.border}`}>{questions.length} questions</span>
        </h2>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard key={i} question={q} index={i} roundType={roundType} />
          ))}
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${cc.text}`} />
          5 Questions to Ask Your Interviewer
        </h3>
        <div className="space-y-2">
          {questionsToAsk.map((q, i) => (
            <div key={i} className={`flex gap-3 p-3 rounded-xl ${cc.bg} border ${cc.border}`}>
              <span className={`text-xs font-bold ${cc.text} flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-slate-800`}>{i + 1}</span>
              <p className="text-xs text-slate-300">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
