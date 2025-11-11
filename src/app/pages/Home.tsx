import type { RequestInfo } from "rwsdk/worker";

import { loadDriverDashboard, type DriverDashboardData } from "@/app/data/driver-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type HomeProps = DriverDashboardData;

export const Home = async (requestInfo: RequestInfo) => {
  const data = await loadDriverDashboard(requestInfo);
  return <HomeScreen {...data} />;
};

const HomeScreen = ({
  driver,
  dispatch,
  workflow,
  actions,
  checklist,
  impoundPreparation,
  nextAction,
}: HomeProps) => (
  <div className="relative min-h-screen bg-slate-950">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(18,44,73,0.95)_0%,_rgba(10,16,25,1)_55%,_rgba(6,10,18,1)_100%)]" />
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 pb-28 pt-6 sm:max-w-lg">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Tower Delight · Driver Ops
          </span>
          <h1 className="text-2xl font-semibold text-slate-50">{driver.name}</h1>
          <p className="text-sm text-slate-400">
            {driver.role} · {driver.truck}
          </p>
        </div>
        <Badge className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
          {driver.status}
        </Badge>
      </header>

      <PersonaInsights shift={driver.shift} />

      <DispatchCard dispatch={dispatch} workflowStages={workflow} />

      <ActionBar actions={actions} />

      <SafetyChecklist checklist={checklist} />

      <ImpoundPrep items={impoundPreparation} />

      <FooterNotes />
    </main>
    <BottomActionCTA nextAction={nextAction} />
  </div>
);

const PersonaInsights = ({ shift }: { shift: string }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-200">Shift Snapshot</span>
      <span className="text-xs text-slate-400">Persona: High Tempo Operator</span>
    </div>
    <p className="mt-2 text-sm text-slate-300">
      Prioritizes rapid scene clearance while staying compliant with APD policy.
      Streamlined actions minimize thumb travel and cognitive load for gloved,
      in-cab use.
    </p>
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
      <Badge variant="muted" className="border-slate-800/70 bg-slate-900/80 text-slate-200">
        {shift}
      </Badge>
      <Badge variant="muted" className="border-slate-800/70 bg-slate-900/80 text-slate-200">
        Prefers large tap targets over nested menus
      </Badge>
      <Badge variant="muted" className="border-slate-800/70 bg-slate-900/80 text-slate-200">
        Needs offline capture fallback
      </Badge>
    </div>
  </Card>
);

const DispatchCard = ({
  dispatch,
  workflowStages,
}: {
  dispatch: HomeProps["dispatch"];
  workflowStages: HomeProps["workflow"];
}) => (
  <Card className="bg-slate-900/[0.85] p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Active Dispatch
        </p>
        <h2 className="text-lg font-semibold text-slate-50">
          #{dispatch.ticketId}
        </h2>
      </div>
      <Badge className="border border-amber-500/40 bg-amber-400/10 text-amber-200">
        ETA {dispatch.etaMinutes} min
      </Badge>
    </div>
    <div className="mt-4 space-y-3 text-sm text-slate-200">
      <DispatchRow label="Location" value={dispatch.location} />
      <DispatchRow label="Vehicle" value={dispatch.vehicle} />
      <DispatchRow label="Contact" value={dispatch.customer} />
    </div>
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Workflow
      </h3>
      <div className="mt-3 space-y-3">
        {workflowStages.map((stage, index) => (
          <div className="flex items-center gap-3" key={stage.key}>
            <StageIcon index={index} status={stage.status} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-50">{stage.label}</p>
              <p className="text-xs text-slate-400">{stage.detail}</p>
            </div>
            <span className="text-xs text-slate-500">
              {stage.status === "complete"
                ? stage.occurredAt
                : stage.status === "active"
                  ? "Now"
                  : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const DispatchRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-900/60 px-4 py-3">
    <span className="text-xs uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-100 text-right">{value}</span>
  </div>
);

const StageIcon = ({
  index,
  status,
}: {
  index: number;
  status: HomeProps["workflow"][number]["status"];
}) => {
  if (status === "complete") {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/60 bg-emerald-500/15 text-emerald-300">
        ✓
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/60 bg-amber-400/15 text-amber-200">
        {index + 1}
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900/70 text-slate-500">
      {index + 1}
    </span>
  );
};

const ActionBar = ({ actions }: { actions: HomeProps["actions"] }) => (
  <Card className="p-4">
    <header className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-100">Priority Actions</p>
      <span className="text-xs text-slate-500">Last updated just now</span>
    </header>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          className="h-auto w-full rounded-2xl px-6 py-4 text-sm font-semibold shadow-md shadow-slate-950/20"
        >
          {action.label}
        </Button>
      ))}
    </div>
    <p className="mt-3 text-xs text-slate-400">
      Sorted by driver persona preferences: quick thumb reach, low taps, high
      signal actions first.
    </p>
  </Card>
);

const SafetyChecklist = ({ checklist }: { checklist: HomeProps["checklist"] }) => (
  <Card className="p-5">
    <header className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-100">On Scene Checklist</p>
        <p className="text-xs text-slate-400">
          Prioritized for officer hand-off and policy compliance
        </p>
      </div>
      <Badge variant="muted" className="border-slate-800 bg-slate-900 text-slate-400">
        2 remaining
      </Badge>
    </header>
    <div className="mt-4 space-y-3">
      {checklist.map((item) => (
        <label
          key={item.id}
          className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
        >
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-brand focus:ring-brand sm:h-4 sm:w-4"
            defaultChecked={item.complete}
          />
          <div className="flex-1">
            <p className="font-medium">{item.label}</p>
            {item.critical && (
              <p className="text-xs text-amber-300">Critical · requires photo proof</p>
            )}
          </div>
        </label>
      ))}
    </div>
  </Card>
);

const ImpoundPrep = ({ items }: { items: HomeProps["impoundPreparation"] }) => (
  <Card className="p-5">
    <header className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-100">Impound Intake Prep</p>
        <p className="text-xs text-slate-400">Pre-filled to reduce bay dwell time</p>
      </div>
      <span className="text-xs text-slate-500">Auto-sync once online</span>
    </header>
    <dl className="space-y-3 text-sm text-slate-200">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-3 rounded-2xl bg-slate-900/50 px-4 py-3"
        >
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {item.title}
          </dt>
          <dd className="flex-1 text-right font-medium text-slate-100">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  </Card>
);

const BottomActionCTA = ({ nextAction }: { nextAction: HomeProps["nextAction"] }) => (
  <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 px-4 pb-6 pt-4 backdrop-blur">
    <div className="mx-auto flex max-w-md items-center justify-between gap-3 sm:max-w-lg">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Next best action
        </p>
        <p className="text-sm font-semibold text-slate-100">
          {nextAction.label}
        </p>
        <p className="text-xs text-slate-400">{nextAction.detail}</p>
      </div>
      <Button className="rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-brand/50">
        Start Capture
      </Button>
    </div>
  </div>
);

const FooterNotes = () => (
  <footer className="pb-4 pt-2 text-center text-xs text-slate-500">
    Designed mobile-first for Tower Delight drivers. Competitor focus: quicker
    thumb-to-action vs. multi-modal dashboards. Trade-off: dense data packed into
    progressive reveal cards for on-shift clarity.
  </footer>
);
