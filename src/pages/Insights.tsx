import InsightsView from "@/components/curiositycompass/InsightsView";

const Insights = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-foreground">Your Insights</h1>
        <p className="font-body text-sm text-muted-foreground">A living report synthesized from your assessments and exploration.</p>
      </div>
      <InsightsView />
    </div>
  );
};

export default Insights;
