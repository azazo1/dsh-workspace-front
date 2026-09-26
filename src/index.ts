/**
 * Host 半区.
 *
 * 提到最前是浏览器里的一次顺序调整, 行为在 Client 半区.
 * 这里仍导出插件行, 让 dsh plugin add 能把它装进 profile.
 */
import type { Context } from '@deepseek-ai/cordis'

/** Loader 行使用的插件名. */
export const name = 'dsh-workspace-front'

/**
 * 记录本插件已装配. 菜单项由 Client 半区注册.
 * @param ctx - Host 插件上下文.
 */
export function apply(ctx: Context): void {
  ctx.logger.info('dsh-workspace-front: 已装配, Workspace 行菜单提供把该 Workspace 提到列表最前')
}
