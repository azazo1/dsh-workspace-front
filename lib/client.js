window.__ModuleLoader__.load({
	id: "dsh-workspace-front",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region src/client/locales.ts
		/** 本插件字典的命名空间. */
		const LOCALE_NS = "dsh-workspace-front";
		/** 中文字典. */
		const zh = { moveToFront: "将 Workspace 提到最前" };
		/** 英文字典. */
		const en = { moveToFront: "Move workspace to front" };
		//#endregion
		//#region src/placement.ts
		/**
		* 计算把指定 Workspace 提到最前时要锚住的当前第一项.
		* 列表是空的, 目标不在列表里, 或目标已经是第一项时, 返回 null.
		* @param items - 宿主登记顺序中的 Workspace.
		* @param workspaceId - 三个点所属的 Workspace.
		* @returns 当前第一项的 id, 或 null 表示不需要移动.
		*/
		function frontAnchor(items, workspaceId) {
			const first = items[0];
			if (first === void 0) return null;
			if (!items.some((item) => item.workspaceId === workspaceId)) return null;
			if (first.workspaceId === workspaceId) return null;
			return first.workspaceId;
		}
		//#endregion
		//#region src/client/workspace-menu.ts
		/**
		* 把 "将 Workspace 提到最前" 插进 Workspace 行的 "..." 菜单.
		*
		* 0.1.7-rc.2 里这个菜单还不是 slot, 只有重命名和删除工作区.
		* 新行复制这两行正在使用的 class, 高度, 字号, 内边距和图标尺寸因此跟它们一致,
		* 而不是另画一套更大的菜单单元.
		*/
		const MOUNT_ATTR = "data-dsh-workspace-front";
		const ROW_KEY_PREFIX = "workspace:";
		/**
		* 取模板时冒充 Workspace 名字的哨兵, 只在本文件里用, 不会被渲染出来.
		*/
		const NAME_SENTINEL = "";
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
		function isActionsTrigger(button, workspaceT) {
			const template = workspaceT("actions.workspace.aria", { name: NAME_SENTINEL });
			const at = template.indexOf(NAME_SENTINEL);
			if (at < 0) return false;
			const prefix = template.slice(0, at);
			const suffix = template.slice(at + 1);
			const aria = button.getAttribute("aria-label") ?? "";
			return aria.length > prefix.length + suffix.length && aria.startsWith(prefix) && aria.endsWith(suffix);
		}
		/**
		* 从三个点按钮所在的 Workspace 行读出 workspace id.
		* @param button - 行内的按钮.
		* @returns workspace id, 或按钮不在 Workspace 行上.
		*/
		function workspaceIdFromButton(button) {
			const key = button.closest("[data-row-key]")?.getAttribute("data-row-key") ?? "";
			if (!key.startsWith(ROW_KEY_PREFIX)) return void 0;
			const workspaceId = key.slice(10);
			return workspaceId.length > 0 ? workspaceId : void 0;
		}
		/**
		* 确认这是某个 Workspace 的三个点, 而不是同一行上的新建会话.
		* @param button - 被点到的按钮.
		* @param items - 当前 Workspace 列表.
		* @param workspaceT - 宿主文案.
		* @returns 对应的 Workspace, 或不是这个菜单的触发器.
		*/
		function workspaceForButton(button, items, workspaceT) {
			const workspaceId = workspaceIdFromButton(button);
			if (workspaceId === void 0) return void 0;
			const item = items.find((candidate) => candidate.workspaceId === workspaceId);
			if (item === void 0) return void 0;
			return isActionsTrigger(button, workspaceT) ? item : void 0;
		}
		/**
		* 打开的菜单是不是 Workspace 行的重命名 / 删除工作区菜单.
		* @param menu - 一个 role=menu 的节点.
		* @param workspaceT - 宿主文案.
		* @returns 两个内建项都在时为 true.
		*/
		function isWorkspaceMenu(menu, workspaceT) {
			const labels = [...menu.querySelectorAll("[role=\"menuitem\"]")].map((item) => item.textContent?.trim());
			return labels.includes(workspaceT("rename")) && labels.includes(workspaceT("delete.workspace"));
		}
		/**
		* 抄第一颗内建菜单行的 class. 重命名排在第一, 没有危险色.
		* @param menu - Workspace 菜单.
		* @returns 四段 class, 或结构对不上.
		*/
		function sampleRow(menu) {
			const button = menu.querySelector("button[role=\"menuitem\"]");
			if (!(button instanceof HTMLButtonElement)) return void 0;
			const spans = button.querySelectorAll(":scope > span");
			const icon = spans[0];
			const label = spans[1];
			const wrap = button.parentElement;
			if (icon === void 0 || label === void 0 || wrap === null) return void 0;
			return {
				wrapClass: wrap.className,
				buttonClass: button.className,
				iconClass: icon.className,
				labelClass: label.className
			};
		}
		/** 和宿主 IconChevronUpOutlineRegular 同一条路径, 尺寸交给抄来的图标 class. */
		function chevronUp() {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("width", "14");
			svg.setAttribute("height", "14");
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("aria-hidden", "true");
			svg.setAttribute("stroke-width", "1");
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", "M12 10L8.70711 6.70711C8.31658 6.31658 7.68342 6.31658 7.29289 6.70711L4 10");
			path.setAttribute("stroke", "currentColor");
			svg.append(path);
			return svg;
		}
		/**
		* 用抄来的 class 做一颗菜单行, 几何和重命名, 删除工作区相同.
		* @param sample - 内建行的 class.
		* @param label - 本插件文案.
		* @param disabled - 该 Workspace 已经排在最前时置灰, 跟内建行的禁用样式一致.
		* @param onSelect - 点击后移动并关闭菜单.
		* @returns 可插进菜单的行.
		*/
		function createRow(sample, label, disabled, onSelect) {
			const wrap = document.createElement("div");
			wrap.className = sample.wrapClass;
			const button = document.createElement("button");
			button.type = "button";
			button.setAttribute("role", "menuitem");
			button.className = sample.buttonClass;
			button.disabled = disabled;
			const icon = document.createElement("span");
			icon.className = sample.iconClass;
			icon.append(chevronUp());
			const text = document.createElement("span");
			text.className = sample.labelClass;
			text.textContent = label;
			button.append(icon, text);
			if (!disabled) button.addEventListener("click", (event) => {
				event.stopPropagation();
				onSelect();
			});
			wrap.append(button);
			return wrap;
		}
		/** 用 Escape 关掉宿主菜单, 跟键盘关闭走同一条路. */
		function closeMenu() {
			document.dispatchEvent(new KeyboardEvent("keydown", {
				key: "Escape",
				bubbles: true
			}));
		}
		/**
		* 监听 Workspace 三个点, 在菜单打开后补上一行.
		* 行一直在, 只是该 Workspace 已经排在最前时置灰.
		* @param options - 列表, 文案和移动回调.
		* @returns 卸下监听的函数.
		*/
		function installWorkspaceMenu(options) {
			let pendingId;
			let mountedMenu;
			let mountedRow;
			let warned = false;
			const clearMounted = () => {
				mountedMenu = void 0;
				mountedRow = void 0;
				pendingId = void 0;
			};
			const mountIntoOpenMenu = () => {
				if (pendingId === void 0 || mountedRow?.isConnected === true) return;
				const workspaceId = pendingId;
				const anchor = frontAnchor(options.workspaces.getSnapshot().items, workspaceId);
				const menu = [...document.querySelectorAll("[role=\"menu\"]")].filter((menu) => isWorkspaceMenu(menu, options.workspaceT)).at(-1);
				if (menu === void 0) return;
				mountedMenu = menu;
				mountedRow = void 0;
				const sample = sampleRow(menu);
				if (sample === void 0) {
					if (!warned) {
						warned = true;
						options.warn("dsh-workspace-front: 宿主菜单行结构变了, 无法沿用重命名和删除工作区的样式");
					}
					return;
				}
				const viewport = menu.querySelector(":scope > [role=\"presentation\"]") ?? menu;
				const row = createRow(sample, options.rowT("moveToFront"), anchor === null, () => {
					if (anchor === null) return;
					options.moveToFront(workspaceId, anchor);
					closeMenu();
				});
				row.setAttribute(MOUNT_ATTR, "");
				viewport.append(row);
				mountedRow = row;
			};
			const observer = new MutationObserver(() => {
				if (mountedMenu !== void 0 && !mountedMenu.isConnected) clearMounted();
				else if (mountedRow !== void 0 && !mountedRow.isConnected) mountedRow = void 0;
				mountIntoOpenMenu();
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
			const onClick = (event) => {
				if (!(event.target instanceof Element)) return;
				const button = event.target.closest("button");
				if (!(button instanceof HTMLButtonElement)) return;
				const workspace = workspaceForButton(button, options.workspaces.getSnapshot().items, options.workspaceT);
				if (workspace === void 0) return;
				pendingId = workspace.workspaceId;
				mountedMenu = void 0;
				queueMicrotask(mountIntoOpenMenu);
			};
			document.addEventListener("click", onClick, true);
			return () => {
				document.removeEventListener("click", onClick, true);
				observer.disconnect();
				clearMounted();
			};
		}
		//#endregion
		//#region src/client/index.ts
		/** Client factory 等这些服务就绪后再装配. */
		const inject = ["locale", "workspaces"];
		/**
		* 登记字典, 并在 Workspace 三个点菜单里补上 "提到最前".
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(LOCALE_NS, {
				zh,
				en
			}), "dsh-workspace-front: dictionaries");
			const moveToFront = (workspaceId, beforeWorkspaceId) => {
				const target = workspaceId;
				const anchor = beforeWorkspaceId;
				ctx.logger.info("dsh-workspace-front: 把 Workspace %s 插到 %s 之前", target, anchor);
				ctx.workspaces.insertBefore(target, anchor).then(() => {
					ctx.logger.info("dsh-workspace-front: Workspace %s 已提到列表最前", target);
				}, (error) => {
					const detail = error instanceof Error ? error.message : String(error);
					ctx.logger.error("dsh-workspace-front: 提到最前失败, workspace=%s, %s", target, detail);
				});
			};
			ctx.effect(() => installWorkspaceMenu({
				workspaces: ctx.workspaces.list,
				workspaceT: ctx.locale.bind("workspace"),
				rowT: ctx.locale.bind(LOCALE_NS),
				moveToFront,
				warn: (message) => {
					ctx.logger.error(message);
				}
			}), "dsh-workspace-front: workspace menu row");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map