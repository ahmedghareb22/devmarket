# DevMarket Development Guide

This guide provides best practices and workflows for developing DevMarket.

## Code Standards

### TypeScript
- Use strict mode (`"strict": true` in tsconfig.json)
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` if necessary
- Use type inference where appropriate

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: "BUYER" | "SELLER";
}

// Bad
const user: any = { id: "123" };
```

### React Components
- Use functional components with hooks
- Prefer React Server Components by default
- Use `"use client"` only when necessary
- Keep components focused and single-responsibility

```typescript
// Good - Server Component
export default function CoursesPage() {
  const courses = await getCourses();
  return <CourseList courses={courses} />;
}

// Client Component when needed
"use client";
export function CourseFilter() {
  const [filter, setFilter] = useState("");
  // ...
}
```

### File Organization
```
components/
├── ui/                 # Reusable UI components
├── course-card.tsx     # Feature-specific components
└── reviews-section.tsx

app/
├── api/               # API routes
├── auth/              # Auth pages
└── courses/           # Feature pages

lib/
├── prisma.ts          # Database client
├── utils.ts           # Utility functions
└── validations/       # Zod schemas
```

## Database Development

### Schema Changes
1. Update `prisma/schema.prisma`
2. Create migration: `pnpm prisma migrate dev --name description`
3. Test migration locally
4. Commit changes

```prisma
// Example: Add new field
model Course {
  // ... existing fields
  duration    Int?     // in minutes
  updatedAt   DateTime @updatedAt
}
```

### Query Optimization
```typescript
// Good - Select only needed fields
const courses = await prisma.course.findMany({
  select: {
    id: true,
    title: true,
    price: true,
  },
});

// Good - Use include for relations
const course = await prisma.course.findUnique({
  where: { id },
  include: {
    author: true,
    modules: true,
  },
});

// Bad - Fetching all fields
const courses = await prisma.course.findMany();
```

## API Development

### Route Handlers
```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.course.findMany();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    // Validate and process...
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    );
  }
}
```

### Input Validation
```typescript
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  price: z.number().min(0).max(10000),
});

try {
  const data = createCourseSchema.parse(body);
  // Process validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.errors },
      { status: 400 }
    );
  }
}
```

## Server Actions

```typescript
// app/actions/courses.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function publishCourse(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED" },
    });

    return { success: true, course };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Testing

### Unit Tests
```typescript
// __tests__/utils.test.ts
import { formatPrice, generateSlug } from "@/lib/utils";

describe("formatPrice", () => {
  it("should format price correctly", () => {
    expect(formatPrice(99.99)).toBe("$99.99");
    expect(formatPrice(1000)).toBe("$1,000.00");
  });
});

describe("generateSlug", () => {
  it("should generate valid slug", () => {
    expect(generateSlug("Web Development 101")).toBe("web-development-101");
  });
});
```

### Integration Tests
```typescript
// __tests__/api/courses.test.ts
import { POST } from "@/app/api/courses/route";

describe("POST /api/courses", () => {
  it("should create course", async () => {
    const request = new Request("http://localhost:3000/api/courses", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Course",
        description: "Test Description",
        price: 99.99,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

## Performance Tips

### Database
- Use indexes for frequently queried fields
- Limit query results with `take` and `skip`
- Use `select` to fetch only needed fields
- Cache query results when appropriate

### Frontend
- Use `next/image` for image optimization
- Implement pagination for large lists
- Use React.memo for expensive components
- Lazy load components with `dynamic()`

```typescript
import dynamic from "next/dynamic";

const ReviewsSection = dynamic(
  () => import("@/components/reviews-section"),
  { loading: () => <p>Loading...</p> }
);
```

## Security Best Practices

### Authentication
- Always check `session?.user?.id` in protected routes
- Use middleware for route protection
- Never expose sensitive data in client components

### Input Validation
- Validate all user inputs with Zod
- Sanitize database queries
- Use parameterized queries (Prisma does this)

### Secrets Management
- Never commit `.env.local` to git
- Use environment variables for secrets
- Rotate secrets regularly
- Use different secrets for dev/prod

## Git Workflow

### Branch Strategy
```bash
# Feature branch
git checkout -b feature/add-reviews

# Make changes
git add .
git commit -m "feat: add review system"

# Push and create PR
git push origin feature/add-reviews
```

### Commit Messages
```
feat: add review system
fix: resolve cart calculation bug
docs: update deployment guide
style: format code
refactor: optimize database queries
test: add unit tests for utils
chore: update dependencies
```

## Debugging

### Enable Debug Logging
```typescript
// In development
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// Or use a debug library
import debug from "debug";
const log = debug("devmarket:courses");
log("Fetching courses...");
```

### Database Debugging
```bash
# Open Prisma Studio
pnpm prisma studio

# View query logs
DATABASE_LOG=query pnpm dev
```

### Browser DevTools
- Use React DevTools for component inspection
- Use Network tab for API debugging
- Use Console for error messages

## Common Tasks

### Add New Feature
1. Create feature branch: `git checkout -b feature/name`
2. Update database schema if needed
3. Create API routes
4. Create UI components
5. Add tests
6. Create PR for review

### Fix Bug
1. Create bug branch: `git checkout -b fix/description`
2. Write test that reproduces bug
3. Fix the bug
4. Verify test passes
5. Create PR

### Update Dependencies
```bash
# Check for updates
pnpm outdated

# Update all
pnpm update

# Update specific package
pnpm update prisma

# Run tests to verify
pnpm test
```

## Documentation

### Code Comments
```typescript
// Good - Explain why, not what
// Cache courses for 1 hour to reduce database load
export const revalidate = 3600;

// Bad - Obvious from code
// Get all courses
const courses = await prisma.course.findMany();
```

### JSDoc Comments
```typescript
/**
 * Calculate total course earnings
 * @param courseId - The course ID
 * @returns Total earnings in cents
 */
export async function getTotalEarnings(courseId: string): Promise<number> {
  // ...
}
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Happy coding!** 🚀
