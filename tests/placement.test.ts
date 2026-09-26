import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { frontAnchor, type WorkspaceOrderItem } from '../src/placement.ts'

const items: readonly WorkspaceOrderItem[] = [
  { workspaceId: 'ws-a' },
  { workspaceId: 'ws-b' },
  { workspaceId: 'ws-c' },
]

describe('frontAnchor', () => {
  it('anchors a later workspace on the current first item', () => {
    assert.equal(frontAnchor(items, 'ws-c'), 'ws-a')
  })

  it('skips a workspace that is already first', () => {
    assert.equal(frontAnchor(items, 'ws-a'), null)
  })

  it('skips an unknown workspace and an empty list', () => {
    assert.equal(frontAnchor(items, 'ws-missing'), null)
    assert.equal(frontAnchor([], 'ws-a'), null)
    assert.equal(frontAnchor([{ workspaceId: 'ws-a' }], 'ws-a'), null)
  })
})
