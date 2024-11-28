import React from "react";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import Button from "@atlaskit/button/new";
import { useGraphStore } from "./store/graphStore";
import { NodeDetails } from "./components/NodeDetails";

function App() {
  const { loading, error } = useGraphStore();

  if (error) {
    return <div className="p-4 text-red-600">Error loading graph: {error}</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b px-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Nexus Navigator</h1>
        <div className="space-x-2">
          <Button appearance="default" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <KnowledgeGraph />
        <NodeDetails />
      </div>
    </div>
  );
}

export default App;
