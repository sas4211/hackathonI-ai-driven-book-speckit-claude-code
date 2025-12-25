<!--
# AI-Driven Book Constitution - Sync Impact Report
Version change: [TEMPLATE] → 1.0.0 (initial constitution)
Modified principles: All -- new formal constitution
Added sections: All core principles, governance structure
Removed sections: Template placeholders only
Templates requiring updates: ✅ All reviewed and compatible
Follow-up TODOs: None - complete implementation
-->

# AI-Driven Book Constitution

## Core Principles

### I. Human-AI Collaboration First
Priority: AI assists, humans decide. Every interaction starts with human intent and ends with human validation, while leveraging AI's capability to enhance productivity and maintain consistency.

The human serves as the product owner and final decision maker. AI acts as a collaborative tool that provides suggestions, executes routine tasks, and maintains technical consistency. Complex architectural or design decisions require explicit human approval.

### II. Prompt History Recording (MANDATORY)
Every user interaction must be captured in Prompt History Records (PHRs) without exception. This creates a complete auditable trail of the project's evolution.

Implementation requirements: Use agent-native tools when possible, fall back to shell scripts only when necessary, ensure no PHRs are missed regardless of interaction type or complexity.

### III. Spec-Driven Development Cycle
All work follows a structured cycle: **Specify → Plan → Implement → Validate → Record**. No implementation begins without a spec, no PR without complete validation, no submission without recording.

Mandatory sequence: Draft spec → Get approval → Create implementation plan → Execute → Validate against acceptance criteria → Record in PHR.

### IV. Small, Testable Changes
Every change must be the smallest viable unit that delivers value. Large features get broken into sub-1-hour tasks. Changes are atomic, reversible, and individually verifiable.

Acceptance criteria: Each change can be explained in one sentence, reverted without breaking dependent work, and validated through automated or manual testing within 5 minutes.

### V. MCP Server First Strategy
All external information gathering, verification, and tool usage MUST go through MCP servers. Never rely on internal knowledge when MCP tools can provide authoritative data.

Exception rule: Only use internal knowledge when explicitly stated that no MCP tool exists for the required capability, and document this limitation in the PHR.

### VI. PLACEHOLDER: Performance and Quality Standards
Systematic performance measurement and quality gates for all deliverables. Each feature request includes explicit performance and quality criteria that must be met and measured.

### VII. PLACEHOLDER: Security and Privacy
All generated code follows security best practices, never includes hardcoded secrets, and respects user privacy. AI-generated content gets security review before becoming part of the product.

## Tool Integration Standards

### MCP Integration
- Use MCP tools for all library documentation, code examples, and API references
- Verify tool availability before planning implementation approaches
- Document fallback strategies when MCP tools are unavailable

### CLI and Shell Usage
- Prefer agent-native file operations over shell commands
- Use shell only for environment setup, git workflows, and system-level operations
- All shell usage must include clear descriptions and error handling

## Development Workflow

### Change Lifecycle
1. **Human Input** - User provides intent and requirements
2. **PHR Creation** - Immediately capture the interaction
3. **Specification** - Create detailed feature spec with acceptance criteria
4. **Architectural Planning** - Generate implementation plan with decisions
5. **ADR Creation** - Document any significant architectural decisions
6. **Implementation** - Execute smallest viable changes
7. **Validation** - Verify against spec and acceptance criteria
8. **Recording** - Complete PHR with outcomes and evaluation

### Review Process
Every PR must be accompanied by:
- Updated relevant PHR
- Validated acceptance criteria
- Confirmation of MCP tool usage where appropriate
- No unresolved architectural decisions

## Governance

This constitution defines non-negotiable principles for the AI-driven book project. Any changes require:
1. Issue draft amendment
2. Document rationale for change
3. Verify backward compatibility
4. Update all dependent artifacts
5. Major version bump for principle changes, minor for additions/clarifications

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07

### Compliance Requirements
- All development work must reference applicable constitution principles
- Code review includes constitution compliance check
- PHR templates verify principle adherence
- Quarterly constitution review for relevance and effectiveness