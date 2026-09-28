# dsh-workspace-front

在 Workspace 行的 "..." 菜单里加一项: 把这个 Workspace 插到侧栏列表最前.

适配 DeepSeek Harness `0.2.0-rc.1`. 这一版里, 那张菜单还不是插件坑位, 里面只有 "重命名" 和 "删除工作区". 新行抄这两行正在使用的样式 class, 所以高度, 字号, 内边距和图标尺寸跟它们一致.

这一项每次都在. 这个 Workspace 已经排在最前时, 它按内建行的禁用样式置灰, 而不是整行消失.

认出三个点按钮只看按钮文案里名字之外的那两段文字, 不拿登记里的 title 去拼. 自动命名的 Workspace 在行上显示的是本地化的默认名, 跟登记里的 `default-workspace` 并不相同, 用 title 拼出来的文案对不上它.

顺序调用宿主的 `workspaces.insertBefore`, 锚点是当前第一项. 省略锚点会追加到末尾, 不是提到最前.

## 菜单行排序约定

rc.2 这张菜单还没有 slot, 于是每个插件都往同一个 `:scope > [role="presentation"]` 末尾追加自己的行. 光靠追加, 顺序就随两边的挂载先后漂 —— 谁先补进来谁在上面. 下面这条约定把顺序钉死, `dsh-open-git` 用同一套规则.

- 插件补的行, 外层节点带 `data-dsh-workspace-menu-order`, 值为优先位; 数字小的靠上, 也就更靠近宿主的 "重命名" 和 "删除工作区". 步长 100 留空档, 跟宿主 slot order 的惯例一致.
- 每一方补完自己那行之后, 把菜单里所有带该属性的行按优先位升序重排一次. 两边都不看对方是谁, 只看数字, 所以谁后补完谁重排, 而最后那次重排一定看得见全部行, 结果与挂载先后无关.
- 宿主自己渲染的行不带这个属性, 不参与重排, 始终留在上面 (插到它们前面会被 React 的下一次渲染抹掉). 没声明优先位的第三方行同样不参与重排, 落在最后.
- 优先位要互不相同, 相同就退化成 DOM 里的先后.

| 插件 | 优先位 | 理由 |
| --- | --- | --- |
| `dsh-workspace-front` | 100 | 动的是这个 Workspace 在列表里的位置, 跟重命名 / 删除工作区同类 |
| `dsh-open-git` | 200 | 把动作送出 harness 到浏览器, 属于外部动作 |

这条约定只覆盖 DOM 适配路径. 哪一天宿主声明了 `sidebar.workspaces.row-menu`, 走原生 slot 的行由 slot 的 order 管, 不打这个属性.

## 命令

```shell
just install
just verify
```

安装到正在使用的 profile:

```shell
dsh plugin add ./dsh-workspace-front
```
