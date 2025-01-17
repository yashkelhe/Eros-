import Link from "next/link";

export default async function Home() {
  return (
    <div className="text-red-300">
      <Link href="/dashboard">Go to the dashboard</Link>
    </div>
  );
}
