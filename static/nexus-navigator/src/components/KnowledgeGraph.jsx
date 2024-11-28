import React, { useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useGraphStore } from "../store/graphStore";

const NODE_COLORS = {
  confluence_page: "#4CA3D9", // Blue
  jira_issue: "#65BA43", // Green
  bitbucket_repo: "#6554C0", // Purple
  person: "#FFB84D", // Orange
  team: "#FF8F73", // Red
};

export function KnowledgeGraph() {
  const { nodes, relationships, loading, fetchGraph, setSelectedNode } = useGraphStore();

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node.id);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="large" />
      </div>
    );
  }

  const graphData = {
    nodes: nodes.map((node) => ({
      ...node,
      color: NODE_COLORS[node.type] || "#ccc",
    })),
    links: relationships.map((rel) => ({
      source: rel.source,
      target: rel.target,
      type: rel.type,
    })),
  };

  return (
    <div className="h-full w-full">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node) => node.properties.title}
        nodeColor={(node) => node.color}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(d) => d.weight * 0.001}
        onNodeClick={handleNodeClick}
        enableNodeDrag={true}
        enableZoomInteraction={true}
      />
    </div>
  );
}
