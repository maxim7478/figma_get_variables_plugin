figma.showUI(__html__, { width: 400, height: 400 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'export-css') {
        try {
            const variables = await figma.variables.getLocalVariablesAsync();

            let css = ':root {\n';

            for (const variable of variables) {
                const name = variable.name
                    .replace(/\s+/g, '-')
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/^-+|-+$/g, '');

                let value = '';

                if (variable.resolvedType === 'COLOR') {
                    const color = variable.valuesByMode[variable.defaultModeId];
                    if (color?.type === 'COLOR') {
                        const { r, g, b } = color.value;
                        value = `#${[r, g, b]
                            .map((c) => Math.round(c * 255).toString(16).padStart(2, '0'))
                            .join('')}`;
                    }
                } else if (variable.resolvedType === 'FLOAT') {
                    const val = variable.valuesByMode[variable.defaultModeId];
                    if (typeof val?.value === 'number') {
                        value = `${val.value}px`;
                    }
                } else if (variable.resolvedType === 'STRING') {
                    const val = variable.valuesByMode[variable.defaultModeId];
                    if (typeof val?.value === 'string') {
                        value = `"${val.value}"`;
                    }
                }

                if (value) {
                    css += `  --${name}: ${value};\n`;
                }
            }

            css += '}\n';

            figma.ui.postMessage({ type: 'css-result', css });
        } catch (err) {
            figma.ui.postMessage({ type: 'error', message: err.message });
        }
    }
};