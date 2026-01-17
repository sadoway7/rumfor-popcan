// Ralph Status - Auto-generated from c:\Users\James\Documents\rumfor versions\rumfor-vpopcan\.ralph\status.json
// Do not edit manually - run tools/compile_ralph_status.py to update

const ralphStatus = {
  "orchestrator": {
    "status": "running",
    "current_cycle": 1,
    "current_agent": "api"
  },
  "agents": {
    "user-types": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to update user types and personas"
    },
    "market-types": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to maintain market categories and tagging"
    },
    "user-flows": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to validate user flows and reduce friction"
    },
    "ui-styles": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to maintain UI styling system"
    },
    "community": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to handle community features"
    },
    "applications": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to manage application workflows"
    },
    "backend": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to validate backend logic"
    },
    "api": {
      "status": "complete",
      "progress": 100,
      "message": "API versioning added for consistency, mobile-first flows ensured"
    },
    "docs": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to update documentation"
    },
    "research": {
      "status": "ready",
      "progress": 0,
      "message": "Ready for investigations and research"
    },
    "simple-solution": {
      "status": "ready",
      "progress": 0,
      "message": "Ready for quick fixes and minimal changes"
    },
    "logic": {
      "status": "ready",
      "progress": 0,
      "message": "Ready to validate business logic"
    }
  }
};

// Helper functions
function getOrchestratorStatus() {
    return ralphStatus.orchestrator;
}

function getAgentStatus(agentName) {
    return ralphStatus.agents[agentName] || {status: 'unknown'};
}

function getAllAgents() {
    return Object.keys(ralphStatus.agents);
}

function isOrchestratorIdle() {
    return ralphStatus.orchestrator.status === 'idle';
}

function getCurrentAgent() {
    return ralphStatus.orchestrator.current_agent;
}

function getRunningAgents() {
    return Object.entries(ralphStatus.agents)
        .filter(([_, status]) => status.status === 'running')
        .map(([name, _]) => name);
}

function getCompletedAgents() {
    return Object.entries(ralphStatus.agents)
        .filter(([_, status]) => status.status === 'complete')
        .map(([name, _]) => name);
}
