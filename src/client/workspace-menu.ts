/**
 * 把 "将 Workspace 提到最前" 插进 Workspace 行的 "..." 菜单.
 *
 * 0.1.7-rc.2 里这个菜单还不是 slot, 只有重命名和删除工作区.
 * 新行复制这两行正在使用的 class, 高度, 字号, 内边距和图标尺寸因此跟它们一致,
 * 而不是另画一套更大的菜单单元.
 */
import { frontAnchor } from '../placement.ts'

/** 识别菜单和计算锚点时用到的 Workspace 事实. */
export interface WorkspaceMenuItem {
  /** 宿主登记的 Workspace id. */
  readonly workspaceId: string
  /** 行上显示的标题, 也写进三个点按钮的 aria-label. */
  readonly title: string
}

/** 宿主 workspace 列表的只读快照源. */
export interface WorkspaceListSource {
  /**
   * 读取当前登记顺序.
   * @returns 带 items 的快照.
   */
  getSnapshot(): { items: readonly WorkspaceMenuItem[] }
}

/** 宿主 workspace 字典里用来认出那个菜单的三个键. */
export type WorkspaceMenuKey = 'actions.workspace.aria' | 'rename' | 'delete.workspace'

/** 安装菜单行时需要的宿主能力. */
export interface WorkspaceMenuOptions {
  /** 当前 Workspace 顺序. */
  workspaces: WorkspaceListSource
  /**
   * 翻译宿主 workspace 字典.
   * @param key - 菜单识别用的键.
   * @param params - 模板参数.
   * @returns 当前语言的文案.
   */
  workspaceT: (key: WorkspaceMenuKey, params?: Record<string, unknown>) => string
  /**
   * 翻译本插件的菜单文案.
   * @param key - 本插件字典键.
   * @returns 当前语言的文案.
   */
  rowT: (key: 'moveToFront') => string
  /**
   * 把 Workspace 插到锚点之前.
   * @param workspaceId - 要移动的 Workspace.
   * @param beforeWorkspaceId - 当前第一项.
   */
  moveToFront: (workspaceId: string, beforeWorkspaceId: string) => void
  /**
   * 宿主菜单结构对不上, 无法沿用它的样式时记录一次.
   * @param message - 给日志的说明.
   */
  warn: (message: string) => void
}

/** 从一颗现成菜单行抄下来的 class. */
interface RowSample {
  readonly wrapClass: string
  readonly buttonClass: string
  readonly iconClass: string
  readonly labelClass: string
}

const MOUNT_ATTR = 'data-dsh-workspace-front'
const ROW_KEY_PREFIX = 'workspace:'

/**
 * 从三个点按钮所在的 Workspace 行读出 workspace id.
 * @param button - 行内的按钮.
 * @returns workspace id, 或按钮不在 Workspace 行上.
 */
function workspaceIdFromButton(button: HTMLButtonElement): string | undefined {
  const key = button.closest<HTMLElement>('[data-row-key]')?.getAttribute('data-row-key') ?? ''
  if (!key.startsWith(ROW_KEY_PREFIX)) return undefined
  const workspaceId = key.slice(ROW_KEY_PREFIX.length)
  return workspaceId.length > 0 ? workspaceId : undefined
}

/**
 * 确认这是某个 Workspace 的三个点, 而不是同一行上的新建会话.
 * @param button - 被点到的按钮.
 * @param items - 当前 Workspace 列表.
 * @param workspaceT - 宿主文案.
 * @returns 对应的 Workspace, 或不是这个菜单的触发器.
 */
function workspaceForButton(
  button: HTMLButtonElement,
  items: readonly WorkspaceMenuItem[],
  workspaceT: WorkspaceMenuOptions['workspaceT'],
): WorkspaceMenuItem | undefined {
  const workspaceId = workspaceIdFromButton(button)
  if (workspaceId === undefined) return undefined
  const item = items.find(candidate => candidate.workspaceId === workspaceId)
  if (item === undefined) return undefined
  const aria = workspaceT('actions.workspace.aria', { name: item.title })
  return button.getAttribute('aria-label') === aria ? item : undefined
}

/**
 * 打开的菜单是不是 Workspace 行的重命名 / 删除工作区菜单.
 * @param menu - 一个 role=menu 的节点.
 * @param workspaceT - 宿主文案.
 * @returns 两个内建项都在时为 true.
 */
function isWorkspaceMenu(menu: HTMLElement, workspaceT: WorkspaceMenuOptions['workspaceT']): boolean {
  const labels = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')]
    .map(item => item.textContent?.trim())
  return labels.includes(workspaceT('rename')) && labels.includes(workspaceT('delete.workspace'))
}

/**
 * 抄第一颗内建菜单行的 class. 重命名排在第一, 没有危险色.
 * @param menu - Workspace 菜单.
 * @returns 四段 class, 或结构对不上.
 */
function sampleRow(menu: HTMLElement): RowSample | undefined {
  const button = menu.querySelector('button[role="menuitem"]')
  if (!(button instanceof HTMLButtonElement)) return undefined
  const spans = button.querySelectorAll(':scope > span')
  const icon = spans[0]
  const label = spans[1]
  const wrap = button.parentElement
  if (icon === undefined || label === undefined || wrap === null) return undefined
  return {
    wrapClass: wrap.className,
    buttonClass: button.className,
    iconClass: icon.className,
    labelClass: label.className,
  }
}

/** 和宿主 IconChevronUpOutlineRegular 同一条路径, 尺寸交给抄来的图标 class. */
function chevronUp(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('stroke-width', '1')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M12 10L8.70711 6.70711C8.31658 6.31658 7.68342 6.31658 7.29289 6.70711L4 10')
  path.setAttribute('stroke', 'currentColor')
  svg.append(path)
  return svg
}

/**
 * 用抄来的 class 做一颗菜单行, 几何和重命名, 删除工作区相同.
 * @param sample - 内建行的 class.
 * @param label - 本插件文案.
 * @param onSelect - 点击后移动并关闭菜单.
 * @returns 可插进菜单的行.
 */
function createRow(sample: RowSample, label: string, onSelect: () => void): HTMLDivElement {
  const wrap = document.createElement('div')
  wrap.className = sample.wrapClass
  const button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('role', 'menuitem')
  button.className = sample.buttonClass
  const icon = document.createElement('span')
  icon.className = sample.iconClass
  icon.append(chevronUp())
  const text = document.createElement('span')
  text.className = sample.labelClass
  text.textContent = label
  button.append(icon, text)
  button.addEventListener('click', (event) => {
    event.stopPropagation()
    onSelect()
  })
  wrap.append(button)
  return wrap
}

/** 用 Escape 关掉宿主菜单, 跟键盘关闭走同一条路. */
function closeMenu(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

/**
 * 监听 Workspace 三个点, 在菜单打开后补上一行.
 * 已经排在最前的 Workspace 不补这一行.
 * @param options - 列表, 文案和移动回调.
 * @returns 卸下监听的函数.
 */
export function installWorkspaceMenu(options: WorkspaceMenuOptions): () => void {
  let pendingId: string | undefined
  let mountedMenu: HTMLElement | undefined

  const clearMounted = (): void => {
    mountedMenu = undefined
    pendingId = undefined
  }

  const mountIntoOpenMenu = (): void => {
    if (pendingId === undefined || mountedMenu !== undefined) return
    const workspaceId = pendingId
    const anchor = frontAnchor(options.workspaces.getSnapshot().items, workspaceId)
    const menus = [...document.querySelectorAll<HTMLElement>('[role="menu"]')]
      .filter(menu => isWorkspaceMenu(menu, options.workspaceT))
    const menu = menus.at(-1)
    if (menu === undefined || menu.hasAttribute(MOUNT_ATTR)) return
    menu.setAttribute(MOUNT_ATTR, '')
    mountedMenu = menu
    if (anchor === null) return
    const sample = sampleRow(menu)
    if (sample === undefined) {
      options.warn('dsh-workspace-front: 宿主菜单行结构变了, 无法沿用重命名和删除工作区的样式')
      return
    }
    const viewport = menu.querySelector<HTMLElement>(':scope > [role="presentation"]') ?? menu
    const row = createRow(sample, options.rowT('moveToFront'), () => {
      options.moveToFront(workspaceId, anchor)
      closeMenu()
    })
    row.setAttribute(MOUNT_ATTR, '')
    viewport.append(row)
  }

  const observer = new MutationObserver(() => {
    if (mountedMenu !== undefined && !mountedMenu.isConnected) clearMounted()
    mountIntoOpenMenu()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  const onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest('button')
    if (!(button instanceof HTMLButtonElement)) return
    const workspace = workspaceForButton(button, options.workspaces.getSnapshot().items, options.workspaceT)
    if (workspace === undefined) return
    pendingId = workspace.workspaceId
    mountedMenu = undefined
    queueMicrotask(mountIntoOpenMenu)
  }
  document.addEventListener('click', onClick, true)

  return () => {
    document.removeEventListener('click', onClick, true)
    observer.disconnect()
    clearMounted()
  }
}
