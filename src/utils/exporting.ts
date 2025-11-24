export const formatVarName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\//g, "-")
    .replace('--', "-")
    .replace(/\s+/g, "-");
}

export const cleanVarName = (name: string): string => {
  return name.replace(/[\[\]"']/g, "");
}

export const normalizeModeName = (name: string): string => {
  const n = name.trim().toLowerCase();
  if (n === "dark") return "dt";
  if (n === "light") return "lt";
  return n.replace(/\s+/g, "-");
}

export const convertToCss = (
  type: VariableResolvedDataType,
  value: any,
  name?: string
): string => {
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
      if (typeof value !== "number" || isNaN(value)) return "0";

      if (name && name.toLowerCase().includes("font-weight")) {
        return `${value}`;
      }

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

export const getCollectionById = async (figmaInstance: PluginAPI, collectionId: string): VariableCollection | null => {
  try {
    return figmaInstance.variables.getVariableCollectionByIdAsync(collectionId);
  } catch {
    return null;
  }
}