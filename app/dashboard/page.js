import { Suspense } from 'react';
import AnalyticsPanel from '../../components/AnalyticsPanel';

export default function DashboardPage() {
  return (
    <div className="mx-auto mt-16 max-w-7xl px-6 pb-16 md:px-12">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-olive">Enterprise dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-charcoal">Premium analytics & store management</h1>
      </div>
      <Suspense fallback={<p className="text-charcoal/70">Loading insights…</p>}>
        <AnalyticsPanel />
      </Suspense>
    </div>
  );
}
