/**
 * Workspace 菜单行的文案. 命名空间与包名一致, 避免和别的插件字典撞车.
 */
import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

/** 本插件字典的命名空间. */
export const LOCALE_NS = 'dsh-workspace-front'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** 把 Workspace 提到列表最前. */
    'dsh-workspace-front': 'moveToFront'
  }
}

/** 中文字典. */
export const zh: LocaleDictOf<typeof LOCALE_NS> = {
  moveToFront: '将 Workspace 提到最前',
}

/** 英文字典. */
export const en: LocaleDictOf<typeof LOCALE_NS> = {
  moveToFront: 'Move workspace to front',
}
