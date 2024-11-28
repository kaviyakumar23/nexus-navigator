import { storage } from "@forge/api";

// Constants for node and relationship types
const NODE_TYPES = {
  CONFLUENCE_PAGE: "confluence_page",
  JIRA_ISSUE: "jira_issue",
  BITBUCKET_REPO: "bitbucket_repo",
  PERSON: "person",
  TEAM: "team",
};

const RELATIONSHIP_TYPES = {
  REFERENCES: "references",
  CREATED_BY: "created_by",
  ASSIGNED_TO: "assigned_to",
  BELONGS_TO: "belongs_to",
  DEPENDS_ON: "depends_on",
};

// Cache implementation with TTL
class Cache {
  constructor(ttlSeconds = 300) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Initialize cache
const nodeCache = new Cache();
const relationshipCache = new Cache();

// Graph operations class
class GraphOperations {
  // Node operations
  async createNode(nodeData) {
    try {
      const node = {
        id: nodeData.id || `node_${Date.now()}`,
        type: nodeData.type,
        properties: {
          title: nodeData.title,
          created: nodeData.created || new Date().toISOString(),
          lastModified: new Date().toISOString(),
          creator: nodeData.creator,
          metadata: nodeData.metadata || {},
        },
      };

      // Store in Forge storage
      await storage.set(`node:${node.id}`, node);

      // Update node index
      const nodeIndex = await this.getNodeIndex();
      nodeIndex.push(node.id);
      await storage.set("nodeIndex", nodeIndex);

      // Update cache
      nodeCache.set(node.id, node);

      return node;
    } catch (error) {
      console.error("Error creating node:", error);
      throw error;
    }
  }

  async getNode(nodeId) {
    try {
      // Check cache first
      const cachedNode = nodeCache.get(nodeId);
      if (cachedNode) return cachedNode;

      // Get from storage
      const node = await storage.get(`node:${nodeId}`);
      if (node) {
        nodeCache.set(nodeId, node);
      }
      return node;
    } catch (error) {
      console.error("Error getting node:", error);
      throw error;
    }
  }

  async updateNode(nodeId, updates) {
    try {
      const node = await this.getNode(nodeId);
      if (!node) throw new Error("Node not found");

      const updatedNode = {
        ...node,
        properties: {
          ...node.properties,
          ...updates,
          lastModified: new Date().toISOString(),
        },
      };

      await storage.set(`node:${nodeId}`, updatedNode);
      nodeCache.set(nodeId, updatedNode);

      return updatedNode;
    } catch (error) {
      console.error("Error updating node:", error);
      throw error;
    }
  }

  async deleteNode(nodeId) {
    try {
      // Delete node
      await storage.delete(`node:${nodeId}`);

      // Update node index
      const nodeIndex = await this.getNodeIndex();
      const updatedIndex = nodeIndex.filter((id) => id !== nodeId);
      await storage.set("nodeIndex", updatedIndex);

      // Delete from cache
      nodeCache.set(nodeId, null);

      // Delete associated relationships
      const relationships = await this.getNodeRelationships(nodeId);
      for (const rel of relationships) {
        await this.deleteRelationship(rel.id);
      }

      return true;
    } catch (error) {
      console.error("Error deleting node:", error);
      throw error;
    }
  }

  // Relationship operations
  async createRelationship(sourceId, targetId, type, properties = {}) {
    try {
      const relationship = {
        id: `rel_${Date.now()}`,
        source: sourceId,
        target: targetId,
        type,
        properties: {
          ...properties,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      };

      // Store relationship
      await storage.set(`relationship:${relationship.id}`, relationship);

      // Update relationship index
      const relIndex = await this.getRelationshipIndex();
      relIndex.push(relationship.id);
      await storage.set("relationshipIndex", relIndex);

      // Update cache
      relationshipCache.set(relationship.id, relationship);

      return relationship;
    } catch (error) {
      console.error("Error creating relationship:", error);
      throw error;
    }
  }

  async getNodeRelationships(nodeId) {
    try {
      const relationships = [];
      const relIndex = await this.getRelationshipIndex();

      for (const relId of relIndex) {
        const rel = await this.getRelationship(relId);
        if (rel && (rel.source === nodeId || rel.target === nodeId)) {
          relationships.push(rel);
        }
      }

      return relationships;
    } catch (error) {
      console.error("Error getting node relationships:", error);
      throw error;
    }
  }

  // Index operations
  async getNodeIndex() {
    try {
      const index = await storage.get("nodeIndex");
      return index || [];
    } catch (error) {
      console.error("Error getting node index:", error);
      throw error;
    }
  }

  async getRelationshipIndex() {
    try {
      const index = await storage.get("relationshipIndex");
      return index || [];
    } catch (error) {
      console.error("Error getting relationship index:", error);
      throw error;
    }
  }

  // Batch operations
  async batchCreateNodes(nodes) {
    try {
      const createdNodes = [];
      for (const nodeData of nodes) {
        const node = await this.createNode(nodeData);
        createdNodes.push(node);
      }
      return createdNodes;
    } catch (error) {
      console.error("Error in batch node creation:", error);
      throw error;
    }
  }

  async batchCreateRelationships(relationships) {
    try {
      const createdRelationships = [];
      for (const rel of relationships) {
        const relationship = await this.createRelationship(rel.source, rel.target, rel.type, rel.properties);
        createdRelationships.push(relationship);
      }
      return createdRelationships;
    } catch (error) {
      console.error("Error in batch relationship creation:", error);
      throw error;
    }
  }

  // Graph query operations
  async getGraphSnapshot() {
    try {
      const nodeIndex = await this.getNodeIndex();
      const relIndex = await this.getRelationshipIndex();

      const nodes = await Promise.all(nodeIndex.map((id) => this.getNode(id)));
      const relationships = await Promise.all(relIndex.map((id) => this.getRelationship(id)));

      return {
        nodes: nodes.filter(Boolean),
        relationships: relationships.filter(Boolean),
      };
    } catch (error) {
      console.error("Error getting graph snapshot:", error);
      throw error;
    }
  }
}

// Export the graph operations instance and types
export const graphOps = new GraphOperations();
export { NODE_TYPES, RELATIONSHIP_TYPES };
