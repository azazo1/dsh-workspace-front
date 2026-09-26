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
  /**
   * 登记里的标题. 自动命名的 Workspace 在行上显示的是本地化的默认名,
   * 所以它只用来核对 Workspace 身份, 不能拿来对按钮文案.
   */
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
 * 取模板时冒充 Workspace 名字的哨兵, 只在本文件里用, 不会被渲染出来.
 */
const NAME_SENTINEL = '\u0001'

/**
 * 被点的按钮是不是这一行的 Workspace 动作触发器.
 *
 * 宿主渲染行标题时会换掉自动命名的那个标题: 登记里是 `default-workspace` 的
 * Workspace 显示成本地化的默认名, 所以拿登记里的 title 去拼 aria 会漏掉它.
 * 这里只比名字之外的两段固定文字, 名字由宿主怎么写都不影响.
 * @param button - 行内的按钮.
 * @param workspaceT - 宿主文案.
 * @returns 是 Workspace 动作触发器时为 true.
 */
export function isActionsTrigger(
  button: HTMLButtonElement,
  workspaceT: WorkspaceMenuOptions['workspaceT'],
): boolean {
  const template = workspaceT('actions.workspace.aria', { name: NAME_SENTINEL })
  const at = template.indexOf(NAME_SENTINEL)
  // 模板里没有 {name} 就无从区分触发器, 当作不是.
  if (at < 0) return false
  const prefix = template.slice(0, at)
  const suffix = template.slice(at + NAME_SENTINEL.length)
  const aria = button.getAttribute('aria-label') ?? ''
  return aria.length > prefix.length + suffix.length
    && aria.startsWith(prefix) && aria.endsWith(suffix)
}

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
  return isActionsTrigger(button, workspaceT) ? item : undefined
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
 * @param disabled - 该 Workspace 已经排在最前时置灰, 跟内建行的禁用样式一致.
 * @param onSelect - 点击后移动并关闭菜单.
 * @returns 可插进菜单的行.
 */
function createRow(sample: RowSample, label: string, disabled: boolean, onSelect: () => void): HTMLDivElement {
  const wrap = document.createElement('div')
  wrap.className = sample.wrapClass
  const button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('role', 'menuitem')
  button.className = sample.buttonClass
  button.disabled = disabled
  const icon = document.createElement('span')
  icon.className = sample.iconClass
  icon.append(chevronUp())
  const text = document.createElement('span')
  text.className = sample.labelClass
  text.textContent = label
  button.append(icon, text)
  if (!disabled) {
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onSelect()
    })
  }
  wrap.append(button)
  return wrap
}

/** 用 Escape 关掉宿主菜单, 跟键盘关闭走同一条路. */
function closeMenu(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

/**
 * 监听 Workspace 三个点, 在菜单打开后补上一行.
 * 行一直在, 只是该 Workspace 已经排在最前时置灰.
 * @param options - 列表, 文案和移动回调.
 * @returns 卸下监听的函数.
 */
export function installWorkspaceMenu(options: WorkspaceMenuOptions): () => void {
  let pendingId: string | undefined
  let mountedMenu: HTMLElement | undefined
  let mountedRow: HTMLElement | undefined
  let warned = false

  const clearMounted = (): void => {
    mountedMenu = undefined
    mountedRow = undefined
    pendingId = undefined
  }

  const mountIntoOpenMenu = (): void => {
    if (pendingId === undefined || mountedRow?.isConnected === true) return
    const workspaceId = pendingId
    const anchor = frontAnchor(options.workspaces.getSnapshot().items, workspaceId)
    const menus = [...document.querySelectorAll<HTMLElement>('[role="menu"]')]
      .filter(menu => isWorkspaceMenu(menu, options.workspaceT))
    const menu = menus.at(-1)
    if (menu === undefined) return
    mountedMenu = menu
    mountedRow = undefined
    const sample = sampleRow(menu)
    if (sample === undefined) {
      if (!warned) {
        warned = true
        options.warn('dsh-workspace-front: 宿主菜单行结构变了, 无法沿用重命名和删除工作区的样式')
      }
      return
    }
    const viewport = menu.querySelector<HTMLElement>(':scope > [role="presentation"]') ?? menu
    // 这一项每次都在: 已经排在最前时只是无事可做, 置灰比整行消失好找.
    const row = createRow(sample, options.rowT('moveToFront'), anchor === null, () => {
      if (anchor === null) return
      options.moveToFront(workspaceId, anchor)
      closeMenu()
    })
    row.setAttribute(MOUNT_ATTR, '')
    // 追加在 React 自己的行后面: 这些位置由 React 自己管理, 插在它前面会被下一次渲染抹掉.
    viewport.append(row)
    mountedRow = row
  }

  const observer = new MutationObserver(() => {
    if (mountedMenu !== undefined && !mountedMenu.isConnected) clearMounted()
    else if (mountedRow !== undefined && !mountedRow.isConnected) mountedRow = undefined
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
