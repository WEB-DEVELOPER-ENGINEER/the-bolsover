import Link from "next/link";

export default function NotFound() {
  return (
    <main className="simple-light-main min-h-screen">
      <p>404</p>
      <h1>This address could not be found.</h1>
      <p className="simple-light-lead">The page may have moved or is no longer available.</p>
      <Link href="/" className="editorial-link">Return home <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
