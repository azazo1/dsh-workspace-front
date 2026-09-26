/**
 * dsh-workspace-front 的浏览器半区.
 *
 * Workspace 行的 "..." 在 0.1.7-rc.2 里还不是 slot, 菜单里只有重命名和删除工作区.
 * 这里在那张菜单打开后补一行, 并把该 Workspace 插到列表最前.
 * 行的 class 从旁边的重命名项抄来, 大小和样式跟那两项一致.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { en, LOCALE_NS, zh } from './locales.ts'
import { installWorkspaceMenu } from './workspace-menu.ts'

/** Client factory 等这些服务就绪后再装配. */
export const inject = ['locale', 'workspaces']

/**
 * 登记字典, 并在 Workspace 三个点菜单里补上 "提到最前".
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'dsh-workspace-front: dictionaries')

  const moveToFront = (workspaceId: string, beforeWorkspaceId: string): void => {
    const target = workspaceId as WorkspaceId
    const anchor = beforeWorkspaceId as WorkspaceId
    ctx.logger.info('dsh-workspace-front: 把 Workspace %s 插到 %s 之前', target, anchor)
    void ctx.workspaces.insertBefore(target, anchor).then(() => {
      ctx.logger.info('dsh-workspace-front: Workspace %s 已提到列表最前', target)
    }, (error: unknown) => {
      const detail = error instanceof Error ? error.message : String(error)
      ctx.logger.error('dsh-workspace-front: 提到最前失败, workspace=%s, %s', target, detail)
    })
  }

  ctx.effect(() => installWorkspaceMenu({
    workspaces: ctx.workspaces.list,
    workspaceT: ctx.locale.bind('workspace'),
    rowT: ctx.locale.bind(LOCALE_NS),
    moveToFront,
    warn: message => { ctx.logger.error(message) },
  }), 'dsh-workspace-front: workspace menu row')
}
