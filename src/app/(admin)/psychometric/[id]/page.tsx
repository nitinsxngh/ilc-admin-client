'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { InfoRow, SectionCard } from '@/components/ui/DetailSection';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { PsychometricReportDetail } from '@/types';

function ScoreBar({ pct, level }: { pct: number; level: string }) {
  const color =
    pct >= 70 ? 'bg-emerald-500' : pct >= 58 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-800">{pct}%</span>
        <span className="text-slate-500">{level}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

export default function PsychometricDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<PsychometricReportDetail | null>(null);

  useEffect(() => {
    api.psychometric.get(id).then((res) => setReport(res.data)).catch(console.error);
  }, [id]);

  if (!report) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const { summary } = report;

  return (
    <>
      <Header
        title={summary.profileType || summary.title || 'Psychometric Report'}
        description={report.student?.fullName || 'Report detail'}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/psychometric" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Back to reports
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant={report.reportStatus}>{report.reportStatus}</Badge>
          <Badge variant="default">Grade {report.grade}</Badge>
          {report.reportShareId && (
            <Badge variant="recommended" className="font-mono text-xs">{report.reportShareId}</Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Submission" description="Test completion data">
            <dl>
              <InfoRow label="Student" value={report.student?.fullName} />
              <InfoRow label="Email" value={report.student?.email} />
              <InfoRow label="Career ID" value={report.student?.careerId} />
              <InfoRow label="Questions answered" value={`${report.answered} / ${report.total}`} />
              <InfoRow label="Score" value={report.score ? `${report.score.points} / ${report.score.weightage}` : undefined} />
              <InfoRow label="Attention checks" value={report.attention ? `${report.attention.correct}/${report.attention.total} correct` : undefined} />
              <InfoRow label="Generated" value={report.reportGeneratedAt ? formatDate(report.reportGeneratedAt) : undefined} />
            </dl>
          </SectionCard>

          <div className="lg:col-span-2">
            <SectionCard title="Report Overview" description={summary.subtitle}>
              <dl>
                <InfoRow label="Profile type" value={<span className="font-semibold text-blue-700">{summary.profileType}</span>} />
                <InfoRow label="Data quality" value={summary.dataQualityNote} />
              </dl>
            </SectionCard>
          </div>
        </div>

        {summary.topStrengths.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Top Strengths" description={`${summary.topStrengths.length} identified areas`}>
              <div className="grid gap-3 py-2 sm:grid-cols-2">
                {summary.topStrengths.map((s, i) => (
                  <div key={i} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="font-semibold text-emerald-900">{s.construct}</p>
                    <p className="mt-1 text-sm text-emerald-800">{s.insight}</p>
                    <p className="mt-2 text-xs text-emerald-600">{s.points}/{s.weightage} pts</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {summary.growthAreas.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Growth Areas">
              <div className="grid gap-3 py-2 sm:grid-cols-2">
                {summary.growthAreas.map((g, i) => (
                  <div key={i} className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                    <p className="font-semibold text-amber-900">{g.construct}</p>
                    <p className="mt-1 text-sm text-amber-800">{g.recommendation}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {report.batteries.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Five Batteries Profile" description="Calibrated scores across psychometric dimensions">
              <div className="space-y-6 py-2">
                {report.batteries.map((battery, i) => (
                  <div key={i}>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{battery.tab}</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {battery.constructs?.map((c, j) => (
                        <div key={j} className="rounded-lg border border-slate-100 p-3">
                          <p className="mb-2 text-sm font-medium text-slate-800">{c.name}</p>
                          <ScoreBar pct={c.pct} level={c.level} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {report.recommendations.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Career Recommendations">
              <div className="grid gap-3 py-2 sm:grid-cols-2 lg:grid-cols-3">
                {report.recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">{rec.title}</p>
                      <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                        {rec.fitScore}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-blue-600">{rec.match}</p>
                    {rec.whyAcrossBatteries && (
                      <p className="mt-2 text-sm text-slate-600">{rec.whyAcrossBatteries}</p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {summary.streamDirections.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Stream Directions">
              <div className="grid gap-3 py-2 sm:grid-cols-2">
                {summary.streamDirections.map((s, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{s.whyFit}</p>
                    {s.starterActions?.length > 0 && (
                      <ul className="mt-2 list-inside list-disc text-sm text-slate-500">
                        {s.starterActions.map((a, j) => <li key={j}>{a}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {report.futureReadiness.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Future Readiness">
              <div className="grid gap-3 py-2 sm:grid-cols-2 lg:grid-cols-3">
                {report.futureReadiness.map((m, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 p-3 text-center">
                    <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                    <p className="text-sm font-medium text-slate-700">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.level}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {summary.actionPlan30Days.length > 0 && (
          <div className="mt-6">
            <SectionCard title="30-Day Action Plan">
              <ol className="list-decimal space-y-2 py-2 pl-5">
                {summary.actionPlan30Days.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ol>
            </SectionCard>
          </div>
        )}

        {summary.counsellorNotes.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Counsellor Notes">
              <ul className="space-y-2 py-2">
                {summary.counsellorNotes.map((note, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">{note}</li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {report.constructScores.length > 0 && (
          <div className="mt-6">
            <SectionCard title="Construct Scores" description="Raw scored constructs from the test">
              <div className="max-h-96 overflow-y-auto py-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="py-2 pr-4">Construct</th>
                      <th className="py-2 pr-4">Section</th>
                      <th className="py-2 pr-4">Points</th>
                      <th className="py-2">Weightage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.constructScores.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-4 font-medium text-slate-800">{c.construct}</td>
                        <td className="py-2 pr-4 text-slate-500">{c.section || '—'}</td>
                        <td className="py-2 pr-4">{c.points}</td>
                        <td className="py-2">{c.weightage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </>
  );
}
