# dsh-workspace-front

在 Workspace 行的 "..." 菜单里加一项: 把这个 Workspace 插到侧栏列表最前.

适配 DeepSeek Harness `0.1.7-rc.2`. 这一版里, 那张菜单还不是插件坑位, 里面只有 "重命名" 和 "删除工作区". 新行抄这两行正在使用的样式 class, 所以高度, 字号, 内边距和图标尺寸跟它们一致.

这一项每次都在. 这个 Workspace 已经排在最前时, 它按内建行的禁用样式置灰, 而不是整行消失.

认出三个点按钮只看按钮文案里名字之外的那两段文字, 不拿登记里的 title 去拼. 自动命名的 Workspace 在行上显示的是本地化的默认名, 跟登记里的 `default-workspace` 并不相同, 用 title 拼出来的文案对不上它.

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
