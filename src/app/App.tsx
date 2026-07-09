import { type MouseEvent, useEffect, useState } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import { EmptyState } from "../components/EmptyState";
import { Phase0RawInfoPanel } from "../features/phase-0/Phase0RawInfoPanel";
import { TrustAssessmentPage } from "../features/phase-0/TrustAssessmentPage";
import type { Phase0MessyRecord } from "../features/phase-0/phase0-types";
import { V1FlowWorkbench } from "../features/v1/V1FlowWorkbench";
import type { V1ReviewItem } from "../features/v1/v1-types";

type TabKey = "raw" | "trust";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "raw", label: "原始資訊" },
  { key: "trust", label: "可信度判斷" },
];

const phase0Records = messyReports satisfies Phase0MessyRecord[];

export function App() {
  const [route, setRoute] = useState<"phase0" | "v1">(
    window.location.pathname.startsWith("/v1") ? "v1" : "phase0",
  );
  const [activeTab, setActiveTab] = useState<TabKey>("raw");
  const [pendingReviewItems, setPendingReviewItems] = useState<V1ReviewItem[]>(
    [],
  );
  const [approvedReviewItems, setApprovedReviewItems] = useState<
    V1ReviewItem[]
  >([]);

  useEffect(() => {
    function syncRoute() {
      setRoute(window.location.pathname.startsWith("/v1") ? "v1" : "phase0");
    }

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function submitForReview(item: V1ReviewItem) {
    setPendingReviewItems((currentItems) => [item, ...currentItems]);
  }

  function approveReviewItem(item: V1ReviewItem) {
    setApprovedReviewItems((currentItems) => [item, ...currentItems]);
    setPendingReviewItems((currentItems) =>
      currentItems.filter((reviewItem) => reviewItem.id !== item.id),
    );
  }

  function deleteReviewItem(itemId: string) {
    setPendingReviewItems((currentItems) =>
      currentItems.filter((reviewItem) => reviewItem.id !== itemId),
    );
  }

  function showV1(event?: MouseEvent<HTMLAnchorElement>) {
    event?.preventDefault();
    window.history.pushState({}, "", "/v1/");
    setRoute("v1");
  }

  function showPhase0(event?: MouseEvent<HTMLAnchorElement>) {
    event?.preventDefault();
    window.history.pushState({}, "", "/");
    setRoute("phase0");
  }

  if (route === "v1") {
    return (
      <main className="layout">
        <V1FlowWorkbench
          records={phase0Records}
          pendingSubmissions={pendingReviewItems}
          approvedTasks={approvedReviewItems}
          onSubmitForReview={submitForReview}
          onApproveTask={approveReviewItem}
          onDeleteReviewItem={deleteReviewItem}
          onBackToPhase0={showPhase0}
        />
      </main>
    );
  }

  return (
    <main className="layout">
      <header className="hero">
        <h1>災害資訊整理工作台</h1>
        <p>Phase 0 保留原始資訊與不確定性；v1 依流程設計新增人工審核工作台。</p>
        <a href="/v1/" className="v1-entry-link" onClick={showV1}>
          進入 v1 流程工作台
        </a>
      </header>

      <nav className="tabs" aria-label="第一階段工作區">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="panel">
        {phase0Records.length === 0 ? (
          <EmptyState message="目前沒有資料" />
        ) : activeTab === "raw" ? (
          <Phase0RawInfoPanel records={phase0Records} />
        ) : (
          <TrustAssessmentPage
            records={phase0Records}
            pendingReviewItems={pendingReviewItems}
            approvedReviewItems={approvedReviewItems}
            onSubmitForReview={submitForReview}
          />
        )}
      </section>
    </main>
  );
}
