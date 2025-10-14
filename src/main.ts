// Read the docs https://plugma.dev/docs

export default function () {
// src/main.ts
	figma.showUI(__html__, { width: 400, height: 480 });

	figma.ui.onmessage = async (msg) => {
		if (msg.type === "export-css") {
			try {
				const allVars = figma.variables.getLocalVariables();
				const collections = figma.variables.getLocalVariableCollections();

				if (!allVars.length) {
					figma.ui.postMessage({
						type: "error",
						message: "No variables found in this file."
					});
					return;
				}

				// Группируем по коллекциям
				const grouped: Record<string, Variable[]> = {};
				for (const variable of allVars) {
					const colId = variable.variableCollectionId;
					if (!grouped[colId]) grouped[colId] = [];
					grouped[colId].push(variable);
				}

				const cssBlocks: string[] = [];

				for (const collection of collections) {
					const vars = grouped[collection.id];
					if (!vars) continue;

					const lines: string[] = [];
					lines.push(`/* === ${collection.name} === */`);
					lines.push(`:root {`);

					for (const variable of vars) {
						for (const modeId in variable.valuesByMode) {
							const value = variable.valuesByMode[modeId];
							const mode = collection.modes.find((m) => m.modeId === modeId);

							// 🧠 Default — без суффикса
							const modeSuffix =
								mode && mode.name.toLowerCase() !== "default"
									? "-" + normalizeModeName(mode.name)
									: "";

							// 🧩 Формируем имя переменной без []
							const varName = cleanVarName(
								`${formatVarName(variable.name)}${modeSuffix}`
							);

							let cssValue = "";

							if (value?.type === "VARIABLE_ALIAS") {
								const refVar = figma.variables.getVariableById(value.id);
								if (refVar) {
									// 🧹 чистим имя alias-переменной
									const refName = cleanVarName(formatVarName(refVar.name));
									cssValue = `var(--${refName})`;
								} else {
									cssValue = "/* invalid alias */";
								}
							} else {
								cssValue = convertToCss(variable.resolvedType, value);
							}

							lines.push(`  --${varName}: ${cssValue};`);
						}
					}

					lines.push(`}`);
					cssBlocks.push(lines.join("\n"));
				}

				const css = cssBlocks.join("\n\n");
				figma.ui.postMessage({ type: "css-result", css });
			} catch (error: any) {
				figma.ui.postMessage({
					type: "error",
					message: `Failed to export variables: ${error.message}`
				});
			}
		}
	};

// 🔤 форматирование имени переменной
	function formatVarName(name: string): string {
		return name
			.trim()
			.toLowerCase()
			.replace(/\//g, "-")
			.replace(/\s+/g, "-");
	}

// 🧹 удаляем квадратные скобки и кавычки
	function cleanVarName(name: string): string {
		return name.replace(/[\[\]"']/g, "").replace('-gen4', '');
	}

// 🌓 нормализация mode
	function normalizeModeName(name: string): string {
		const n = name.trim().toLowerCase();
		if (n === "dark") return "dt";
		if (n === "light") return "lt";
		return n.replace(/\s+/g, "-");
	}

// 🎨 конвертация значений в CSS
	function convertToCss(type: VariableResolvedDataType, value: any): string {
		switch (type) {
			case "COLOR": {
				const color = value as RGBA;
				if (
					typeof color?.r !== "number" ||
					typeof color?.g !== "number" ||
					typeof color?.b !== "number"
				) {
					return "/* invalid color */";
				}

				const R = Math.round(color.r * 255);
				const G = Math.round(color.g * 255);
				const B = Math.round(color.b * 255);
				const A = color.a ?? 1;

				return A < 1
					? `rgba(${R}, ${G}, ${B}, ${A.toFixed(2)})`
					: `#${((1 << 24) + (R << 16) + (G << 8) + B)
						.toString(16)
						.slice(1)}`;
			}

			case "FLOAT": {
				if (typeof value !== "number" || isNaN(value)) return "0rem";
				const rem = +(value / 16).toFixed(4);
				return `${rem}rem`;
			}

			case "STRING":
				return `"${value}"`;

			case "BOOLEAN":
				return value ? "true" : "false";

			default:
				return "/* unsupported type */";
		}
	}
}

