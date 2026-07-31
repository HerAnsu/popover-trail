# Multi-Branch DAG Engine Design Specification

## Overview
Upgrade the `popover-trail` core state store from a 1D linear stack (`TrailEntry[]`) to a Directed Acyclic Graph (DAG) state tree (`PopoverDAGNode`).

## Core Concepts
1. **Multi-Branch Cascading**: Allows users to expand multiple sibling branches simultaneously (e.g. inspecting two sub-items side by side) without forcing unpinned popovers to close.
2. **DAG Merging & Deduplication**: If two separate branches (`A -> B -> D` and `A -> C -> D`) navigate to the same entity node `D`, the engine merges their topology into a single shared node with multiple incoming anchor connectors.
3. **Branch-Aware BFS Teardown**: Closing a node prunes only its specific DAG subtree, leaving sibling branches intact.

## Proposed Store Modifications
- Replace `trail: TrailEntry[]` with `dag: Map<string, PopoverDAGNode>` and `rootKeys: Set<string>`.
- Extend `PopoverSchemaNode` with `maxConcurrentBranches?: number`.
