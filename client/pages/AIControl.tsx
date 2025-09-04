import AIControlPanel from "@/components/railbharti/AIControlPanel";
import AnimatedRailMap from "@/components/railbharti/map/AnimatedRailMap";

export default function AIControl() {
  return (
    <div>
      <div className="container pt-8">
        <h1 className="text-3xl font-bold">AI Control</h1>
        <p className="text-muted-foreground">Manage simulations and view effects</p>
      </div>
      <div className="container mt-6">
        <AnimatedRailMap height={360} />
      </div>
      <AIControlPanel />
    </div>
  );
}
