export default function Contact() {
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-3 text-muted-foreground">For collaboration or queries: contact@railbharti.app</p>
      <form className="mt-6 max-w-xl grid gap-3">
        <input placeholder="Your name" className="w-full rounded-md bg-secondary/60 border border-border/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60" />
        <input placeholder="Email" type="email" className="w-full rounded-md bg-secondary/60 border border-border/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60" />
        <textarea placeholder="Message" rows={5} className="w-full rounded-md bg-secondary/60 border border-border/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60" />
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-3 neon-glow-cyan">Send</button>
      </form>
    </section>
  );
}
