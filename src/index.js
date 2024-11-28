import Resolver from "@forge/resolver";
import { graphOps, NODE_TYPES, RELATIONSHIP_TYPES } from "./api/graphCore";

const resolver = new Resolver();

// Node operations
resolver.define("createNode", async ({ payload }) => {
  return await graphOps.createNode(payload);
});

resolver.define("getNode", async ({ payload }) => {
  return await graphOps.getNode(payload.nodeId);
});

resolver.define("updateNode", async ({ payload }) => {
  return await graphOps.updateNode(payload.nodeId, payload.updates);
});

resolver.define("deleteNode", async ({ payload }) => {
  return await graphOps.deleteNode(payload.nodeId);
});

// Relationship operations
resolver.define("createRelationship", async ({ payload }) => {
  const { source, target, type, properties } = payload;
  return await graphOps.createRelationship(source, target, type, properties);
});

resolver.define("getNodeRelationships", async ({ payload }) => {
  return await graphOps.getNodeRelationships(payload.nodeId);
});

// Graph operations
resolver.define("getGraphSnapshot", async () => {
  return await graphOps.getGraphSnapshot();
});

// Batch operations
resolver.define("batchCreateNodes", async ({ payload }) => {
  return await graphOps.batchCreateNodes(payload.nodes);
});

resolver.define("batchCreateRelationships", async ({ payload }) => {
  return await graphOps.batchCreateRelationships(payload.relationships);
});

export const handler = resolver.getDefinitions();
