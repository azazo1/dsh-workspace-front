# dsh-workspace-front

在 Workspace 行的 "..." 菜单里加一项: 把这个 Workspace 插到侧栏列表最前.

适配 DeepSeek Harness `0.1.7-rc.2`. 这一版里, 那张菜单还不是插件坑位, 里面只有 "重命名" 和 "删除工作区". 新行抄这两行正在使用的样式 class, 所以高度, 字号, 内边距和图标尺寸跟它们一致.

这个 Workspace 已经排在最前时, 菜单里不显示这一项.

顺序调用宿主的 `workspaces.insertBefore`, 锚点是当前第一项. 省略锚点会追加到末尾, 不是提到最前.

## 命令

```shell
just install
just verify
```

安装到正在使用的 profile:

```shell
dsh plugin add ./dsh-workspace-front
```
