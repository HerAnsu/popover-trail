import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PopoverDAG } from './dagCore';

describe('I_Acyclic: Formal Cycle Freedom Invariants', () => {
  const NODE_POOL = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8'];

  it('strictly rejects any edge (u, v) where u is reachable from v [u in Reach(v)]', () => {
    fc.assert(
      fc.property(
        fc.subarray(NODE_POOL, { minLength: 2 }),
        fc.array(fc.tuple(fc.nat(), fc.nat()), { maxLength: 20 }),
        fc.nat(),
        fc.nat(),
        (nodes, edgeCandidates, uIdx, vIdx) => {
          const dag = new PopoverDAG();
          for (const node of nodes) {
            dag.addNode(node);
          }

          for (const [fromIdx, toIdx] of edgeCandidates) {
            const p = nodes[fromIdx % nodes.length];
            const c = nodes[toIdx % nodes.length];
            if (p && c && p !== c) {
              dag.addEdge(p, c);
            }
          }

          const u = nodes[uIdx % nodes.length];
          const v = nodes[vIdx % nodes.length];
          if (!u || !v) return;

          const reachV = new Set([v, ...dag.getDescendantKeys(v)]);

          if (reachV.has(u)) {
            expect(dag.wouldCreateCycle(v, u)).toBe(true);
            const edgeAdded = dag.addEdge(u, v);
            expect(edgeAdded).toBe(false);
            expect(dag.getChildren(u).has(v)).toBe(false);
            expect(dag.getParents(v).has(u)).toBe(false);
          } else {
            expect(dag.wouldCreateCycle(v, u)).toBe(false);
            const edgeAdded = dag.addEdge(u, v);
            expect(edgeAdded).toBe(true);
            expect(dag.getChildren(u).has(v)).toBe(true);
            expect(dag.getParents(v).has(u)).toBe(true);
            expect(dag.getAncestors(v).has(u)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('strictly rejects self-loops: forall u, u in Reach(u) implies edge (u, u) rejected', () => {
    fc.assert(
      fc.property(fc.constantFrom(...NODE_POOL), (u) => {
        const dag = new PopoverDAG();
        dag.addNode(u);

        expect(dag.wouldCreateCycle(u, u)).toBe(true);
        expect(dag.addEdge(u, u)).toBe(false);
        expect(dag.getChildren(u).has(u)).toBe(false);
        expect(dag.getParents(u).has(u)).toBe(false);
      }),
      { numRuns: 50 },
    );
  });

  it('guarantees transitive cycle rejection along path v1 -> v2 -> ... -> vk', () => {
    fc.assert(
      fc.property(fc.shuffledSubarray(NODE_POOL, { minLength: 3 }), (chain) => {
        const dag = new PopoverDAG();
        for (const k of chain) {
          dag.addNode(k);
        }

        for (let i = 0; i < chain.length - 1; i++) {
          const from = chain[i];
          const to = chain[i + 1];
          if (from && to) {
            expect(dag.addEdge(from, to)).toBe(true);
          }
        }

        const head = chain[0];
        const tail = chain.at(-1);
        if (head && tail) {
          expect(dag.getDescendantKeys(head).has(tail)).toBe(true);
          expect(dag.wouldCreateCycle(head, tail)).toBe(true);
          expect(dag.addEdge(tail, head)).toBe(false);
        }
      }),
      { numRuns: 50 },
    );
  });
});
