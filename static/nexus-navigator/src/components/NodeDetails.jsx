import React from "react";
import { useGraphStore } from "../store/graphStore";

export function NodeDetails() {
  const { selectedNode, clearSelection } = useGraphStore();

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="absolute right-0 top-0 w-96 h-full bg-white shadow-lg p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{selectedNode.properties.title}</h2>
        <button onClick={clearSelection} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-700">Type</h3>
          <p className="text-sm">{selectedNode.type}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-700">Created</h3>
          <p className="text-sm">{new Date(selectedNode.properties.created).toLocaleString()}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-700">Creator</h3>
          <p className="text-sm">{selectedNode.properties.creator}</p>
        </div>

        {selectedNode.properties.metadata && (
          <div>
            <h3 className="font-medium text-gray-700">Metadata</h3>
            <pre className="text-sm bg-gray-50 p-2 rounded">{JSON.stringify(selectedNode.properties.metadata, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
