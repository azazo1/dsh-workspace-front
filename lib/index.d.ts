import { Context } from "@deepseek-ai/cordis";
//#region src/index.d.ts
/** Loader 行使用的插件名. */
declare const name = "dsh-workspace-front";
/**
 * 记录本插件已装配. 菜单项由 Client 半区注册.
 * @param ctx - Host 插件上下文.
 */
declare function apply(ctx: Context): void;
//#endregion
export { apply, name };
//# sourceMappingURL=index.d.ts.map