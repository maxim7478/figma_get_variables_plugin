// src/main.ts
import {cleanVarName, convertToCss, formatVarName, getCollectionById, normalizeModeName} from "./utils/exporting.ts";

export default function () {
	figma.showUI(__html__, { width: 400, height: 480 });

	figma.ui.onmessage = async (msg) => {
		if (msg.type === "export-css") {
			let collection = undefined;
			const typeConnection = msg.props?.typeCollection
			if (msg.props?.typeCollection) {
				const collections = await figma.variables.getLocalVariableCollectionsAsync()
				collection = collections.find(elem => elem.name === typeConnection)
			}
			return getCssVariables(figma, collection?.id)
		}

		if (msg.type === "get-collection") {
			const collections = await figma.variables.getLocalVariableCollectionsAsync()
			const collectionsMapped = await Promise.all(collections.map(async (elem) => {
				const data = await figma.variables.getVariableCollectionByIdAsync(elem.id)
				return {
					id: elem.id,
					name: data?.name,
				}
			}))
			figma.ui.postMessage({ type: "get-collection-result", collectionsMapped });
		}

		if (msg.type === 'copy') {
			figma.notify('✅ CSS copied!');
			figma.copyText(msg.text);
		}
	};


	const getCssVariables = async (figmaInstance: PluginAPI, collectionId?: string) => {
		try {
			const allVars = await figmaInstance.variables.getLocalVariablesAsync();

			if (!allVars.length) {
				figmaInstance.ui.postMessage({
					type: "error",
					message: "No variables found in this file.",
				});
				return;
			}

			const cssBlocks: string[] = [];
			cssBlocks.push(`:root {`);

			const grouped: Record<string, Variable[]> = {};
			for (const v of allVars) {
				if (collectionId && collectionId != v.variableCollectionId) {
					continue
				}

				const id = v.variableCollectionId;
				if (!grouped[id]) grouped[id] = [];
				grouped[id].push(v);
			}



			for (const collectionId of Object.keys(grouped)) {
				const vars = grouped[collectionId];
				const collection = await getCollectionById(figmaInstance, collectionId);

				const lines: string[] = [];
				lines.push(`/* === ${collection?.name ?? "Unknown collection"} === */`);

				for (const variable of vars) {
					const modeIds = Object.keys(variable.valuesByMode);
					const ensureModeIds =
						modeIds.length > 0
							? modeIds
							: collection
								? [collection.defaultModeId]
								: [];

					for (const modeId of ensureModeIds) {
						const value = variable.valuesByMode[modeId];
						const mode = collection?.modes.find((m) => m.modeId === modeId);

						const modeSuffix =
							mode && mode.name.toLowerCase() !== "default"
								? "-" + normalizeModeName(mode.name)
								: "";

						const varName = cleanVarName(
							`${formatVarName(variable.name)}${modeSuffix}`
						);

						let cssValue = "";

						if (value?.type === "VARIABLE_ALIAS") {
							const refVar = figmaInstance.variables.getVariableById(value.id);
							if (refVar) {
								const refName = cleanVarName(formatVarName(refVar.name));
								cssValue = `var(--${refName})`;
							} else {
								cssValue = "/* invalid alias */";
							}
						} else {
							const effectiveValue =
								value ??
								(collection
									? variable.valuesByMode[collection.defaultModeId]
									: undefined);

							cssValue = convertToCss(
								variable.resolvedType,
								effectiveValue,
								varName
							);
						}

						lines.push(`  --${varName}: ${cssValue};`);
					}
				}

				cssBlocks.push(lines.join("\n"));
			}
			cssBlocks.push('}')

			const css = cssBlocks.join("\n\n");
			figmaInstance.ui.postMessage({ type: "css-result", css });
		} catch (error: any) {
			figmaInstance.ui.postMessage({
				type: "error",
				message: `Failed to export variables: ${error.message}`,
			});
		}
	}
}
