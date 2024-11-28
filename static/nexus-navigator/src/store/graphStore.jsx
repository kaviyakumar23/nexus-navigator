import { create } from "zustand";
import { invoke } from "@forge/bridge";

export const useGraphStore = create((set, get) => ({
  nodes: [],
  relationships: [],
  loading: false,
  error: null,
  selectedNode: null,

  // Fetch graph data
  fetchGraph: async () => {
    set({ loading: true });
    try {
      const data = await invoke("getGraphSnapshot");
      set({
        nodes: data.nodes,
        relationships: data.relationships,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Node operations
  addNode: async (nodeData) => {
    try {
      const newNode = await invoke("createNode", nodeData);
      set((state) => ({
        nodes: [...state.nodes, newNode],
      }));
      return newNode;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Relationship operations
  addRelationship: async (source, target, type, properties = {}) => {
    try {
      const newRelationship = await invoke("createRelationship", {
        source,
        target,
        type,
        properties,
      });
      set((state) => ({
        relationships: [...state.relationships, newRelationship],
      }));
      return newRelationship;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Selection handling
  setSelectedNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    set({ selectedNode: node });
  },

  clearSelection: () => {
    set({ selectedNode: null });
  },
}));
