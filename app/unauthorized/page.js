import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand/30 px-6 py-24 text-center">
      <div className="rounded-3xl border border-sand bg-white p-10 shadow-xl max-w-md">
        <h1 className="text-4xl font-extrabold text-forest mb-4">Access Denied</h1>
        <p className="text-charcoal/70 text-sm leading-relaxed mb-8">
          You do not have the required permissions to view this workspace. Please contact your administrator if you believe this is an error.
        </p>
        <Link href="/" className="inline-block rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-olive">
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
