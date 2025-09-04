import DashboardSection from "@/components/railbharti/Dashboard";
import AnimatedRailMap from "@/components/railbharti/map/AnimatedRailMap";

export default function Dashboard() {
  return (
    <div>
      <div className="container pt-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">System-wide status and predictions</p>
      </div>
      <div className="container mt-6">
        <AnimatedRailMap height={360} />
      </div>
      <DashboardSection />
    </div>
  );
}
