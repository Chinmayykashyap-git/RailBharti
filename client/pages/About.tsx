export default function About() {
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-bold">About Railभारती</h1>
      <p className="mt-3 text-muted-foreground max-w-prose">
        Railभारती – Indian Rail Essence is a modern, interactive, AI-powered prototype designed for hackathons and tech showcases. It demonstrates real-time train motion, predictive insights, and a futuristic UI crafted with neon accents.
      </p>
      <ul className="mt-6 grid gap-3 text-sm text-muted-foreground list-disc pl-6">
        <li>Real-time animated railway map</li>
        <li>AI predictions for delays, rerouting, and efficiency</li>
        <li>Interactive dashboards and controls</li>
        <li>Responsive and accessible design</li>
      </ul>
    </section>
  );
}
