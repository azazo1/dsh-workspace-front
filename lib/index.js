//#region src/index.ts
/** Loader 行使用的插件名. */
const name = "dsh-workspace-front";
/**
* 记录本插件已装配. 菜单项由 Client 半区注册.
* @param ctx - Host 插件上下文.
*/
function apply(ctx) {
	ctx.logger.info("dsh-workspace-front: 已装配, Workspace 行菜单提供把该 Workspace 提到列表最前");
}
//#endregion
export { apply, name };

//# sourceMappingURL=index.js.map