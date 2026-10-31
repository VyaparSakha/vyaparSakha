"use client";

import EmptyState from "./sections/EmptyState";
import ForecastSection from "./sections/ForecastSection";
import InsightsSection from "./sections/InsightsSection";
import RestockSection from "./sections/RestockSection";
import SummarySection from "./sections/SummarySection";
import AgentFilesSection from "./sections/AgentFilesSection";

const AIDashboardContent = ({
  forecast = [],
  restock = [],
  insights = [],
  summary = null,
  storeId,
  loadingState = {},
  errorState = {},
}) => {
  const allLoading =
    loadingState.forecast && loadingState.restock && loadingState.insights;

  if (allLoading) {
    return (
      <div className="flex flex-col gap-8 lg:flex-row">
        <EmptyState
          title="Loading AI dashboard"
          description="Generating forecasts, restock guidance, and inventory insights."
        />
      </div>
    );
  }

  const primaryFailed =
    !loadingState.forecast &&
    !loadingState.restock &&
    !loadingState.insights &&
    errorState.forecast &&
    errorState.restock &&
    errorState.insights;

  if (primaryFailed) {
    return (
      <EmptyState
        title="AI dashboard unavailable"
        description="Forecast, restock, and insight services are currently unavailable."
      />
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* <SummarySection
        storeId={storeId}
        summary={summary}
        loading={loadingState.summary}
        error={errorState.summary}
      /> */}

      <ForecastSection
        forecast={forecast}
        loading={loadingState.forecast}
        error={errorState.forecast}
      />

      <RestockSection
        restock={restock}
        loading={loadingState.restock}
        error={errorState.restock}
      />

      <InsightsSection
        insights={insights}
        loading={loadingState.insights}
        error={errorState.insights}
      />

      <AgentFilesSection storeId={storeId} />
    </div>
  );
};

export default AIDashboardContent;
