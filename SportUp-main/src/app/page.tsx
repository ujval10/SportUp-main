
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="sr-only">SportUp</span>
          <span className="ml-2 font-bold text-2xl text-primary">SportUp</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary underline-offset-4"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Connect, Play, and Elevate Your Game
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    SportUp is your ultimate platform to discover local sports events, connect with fellow enthusiasts, and manage your own games.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-primary/50 transition-shadow">
                    <Link href="/signup">
                      Get Started
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-accent/50 transition-shadow">
                    <Link href="/events">
                      Browse Events
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                data-ai-hint="sports people playing"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need for Your Sporting Life
                </h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From finding a pickup game to organizing a tournament, SportUp has you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 pt-12">
              <div className="grid gap-1 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-bold text-primary">Event Discovery</h3>
                <p className="text-sm text-foreground/70">
                  Browse and filter events by sport, location, and date. Never miss a game again!
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-bold text-primary">Easy Management</h3>
                <p className="text-sm text-foreground/70">
                  Create, update, and delete your own sports event listings with ease.
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-bold text-primary">User Profiles</h3>
                <p className="text-sm text-foreground/70">
                  Showcase your favorite sports and skill levels to connect with like-minded players.
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-bold text-primary">Calendar View</h3>
                <p className="text-sm text-foreground/70">
                  Visualize upcoming matches with our intuitive calendar.
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-bold text-primary">AI Location Suggestions</h3>
                <p className="text-sm text-foreground/70">
                  Get smart recommendations for event locations powered by AI.
                </p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border">
                <h3 className="text-lg font-bold text-primary">Community</h3>
                <p className="text-sm text-foreground/70">
                  Join a vibrant community of sports lovers in your area.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-secondary/50">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SportUp. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
