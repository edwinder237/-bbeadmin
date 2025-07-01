// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/'])

export default clerkMiddleware((auth, req) => {
  // Allow access to public routes
  if (isPublicRoute(req)) return
  
  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  // Match all routes (avoid matching files like _next or static assets)
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};