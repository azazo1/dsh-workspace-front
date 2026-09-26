import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isActionsTrigger, type WorkspaceMenuKey } from '../src/client/workspace-menu.ts'

// 假的宿主文案: 名字之外的两段文字由这里给定, 不取宿主的真实措辞.
const ACTIONS = '[ws:'
const ACTIONS_SUFFIX = ':actions]'
const NEW_SESSION = '[new-session:'
const NEW_SESSION_SUFFIX = ']'

type Translate = (key: WorkspaceMenuKey, params?: Record<string, unknown>) => string

const workspaceT = ((key, params) => {
  if (key !== 'actions.workspace.aria') return key
  const name = String(params?.name ?? '')
  return `${ACTIONS}${name}${ACTIONS_SUFFIX}`
}) as Translate

/** 只要 getAttribute 的假按钮. */
function button(aria: string | null): HTMLButtonElement {
  return { getAttribute: () => aria } as unknown as HTMLButtonElement
}

describe('isActionsTrigger', () => {
  it('identifies the trigger whatever the host calls the workspace', () => {
    assert.equal(isActionsTrigger(button(`${ACTIONS}alpha${ACTIONS_SUFFIX}`), workspaceT), true)
    assert.equal(isActionsTrigger(button(`${ACTIONS}本地化的默认名${ACTIONS_SUFFIX}`), workspaceT), true)
  })

  it('rejects the neighbouring new-session button and a missing label', () => {
    const newSession = `${NEW_SESSION}alpha${NEW_SESSION_SUFFIX}`
    assert.equal(isActionsTrigger(button(newSession), workspaceT), false)
    assert.equal(isActionsTrigger(button(null), workspaceT), false)
  })

  it('rejects a label that only wraps the template, and a template without a name', () => {
    assert.equal(isActionsTrigger(button(`${ACTIONS}${ACTIONS_SUFFIX}`), workspaceT), false)
    const noName = (() => 'fixed label') as Translate
    assert.equal(isActionsTrigger(button('fixed label'), noName), false)
  })
})
