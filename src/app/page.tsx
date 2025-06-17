export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-akashic-primary">
          Akashic Intelligence
        </h1>
        <p className="text-xl text-akashic-secondary mb-8">
          The Key to Comprehensive Political Understanding
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="btn-primary inline-block"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="btn-secondary inline-block"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  )
}