/**
 * 判断一个 Workspace 该不该被插到列表最前.
 *
 * 列表顺序就是宿主登记顺序, 也是默认分组下列表的展示顺序.
 * 省略 insertBefore 的锚点会追加到末尾, 所以提到最前必须显式锚到当前第一项.
 */

/** 一次排序只需要 id. */
export interface WorkspaceOrderItem {
  /** 宿主登记的 Workspace id. */
  readonly workspaceId: string
}

/**
 * 计算把指定 Workspace 提到最前时要锚住的当前第一项.
 * 列表是空的, 目标不在列表里, 或目标已经是第一项时, 返回 null.
 * @param items - 宿主登记顺序中的 Workspace.
 * @param workspaceId - 三个点所属的 Workspace.
 * @returns 当前第一项的 id, 或 null 表示不需要移动.
 */
export function frontAnchor(
  items: readonly WorkspaceOrderItem[],
  workspaceId: string,
): string | null {
  const first = items[0]
  if (first === undefined) return null
  if (!items.some(item => item.workspaceId === workspaceId)) return null
  if (first.workspaceId === workspaceId) return null
  return first.workspaceId
}
