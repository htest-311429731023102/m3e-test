const darkMode = true;

(async () => {
	const {
		argbFromHex,
		hexFromArgb,
		themeFromSourceColor,
		redFromArgb,
		greenFromArgb,
		blueFromArgb,
	} = await import(
		'https://esm.sh/@material/material-color-utilities?exports=argbFromHex,themeFromSourceColor,redFromArgb,greenFromArgb,blueFromArgb'
	);

	const getMissingColorMap = (theme, mode) => {
		const { primary, secondary, tertiary, neutral } = theme.palettes;

		const lightColors = new Map([
			['--md-sys-color-primary-fixed', rgbFromArgb(primary.tone(90))],
			['--md-sys-color-primary-fixed-dim', rgbFromArgb(neutral.tone(80))],
			['--md-sys-color-on-primary-fixed', rgbFromArgb(primary.tone(10))],
			[
				'--md-sys-color-on-primary-fixed-variant',
				rgbFromArgb(primary.tone(30)),
			],
			['--md-sys-color-secondary-fixed', rgbFromArgb(secondary.tone(90))],
			['--md-sys-color-secondary-fixed-dim', rgbFromArgb(secondary.tone(80))],
			['--md-sys-color-on-secondary-fixed', rgbFromArgb(secondary.tone(10))],
			[
				'--md-sys-color-on-secondary-fixed-variant',
				rgbFromArgb(secondary.tone(30)),
			],
			['--md-sys-color-tertiary-fixed', rgbFromArgb(tertiary.tone(90))],
			['--md-sys-color-tertiary-fixed-dim', rgbFromArgb(tertiary.tone(80))],
			['--md-sys-color-on-tertiary-fixed', rgbFromArgb(tertiary.tone(10))],
			[
				'--md-sys-color-on-tertiary-fixed-variant',
				rgbFromArgb(tertiary.tone(30)),
			],
			['--md-sys-color-surface-dim', rgbFromArgb(neutral.tone(87))],
			['--md-sys-color-surface-bright', rgbFromArgb(neutral.tone(98))],
			[
				'--md-sys-color-surface-container-lowest',
				rgbFromArgb(neutral.tone(100)),
			],
			['--md-sys-color-surface-container-low', rgbFromArgb(neutral.tone(96))],
			['--md-sys-color-surface-container', rgbFromArgb(neutral.tone(94))],
			['--md-sys-color-surface-container-high', rgbFromArgb(neutral.tone(92))],
			[
				'--md-sys-color-surface-container-highest',
				rgbFromArgb(neutral.tone(90)),
			],
		]);

		const darkColors = new Map([
			['--md-sys-color-surface-dim', rgbFromArgb(neutral.tone(6))],
			['--md-sys-color-surface-bright', rgbFromArgb(neutral.tone(24))],
			['--md-sys-color-surface-container-lowest', rgbFromArgb(neutral.tone(4))],
			['--md-sys-color-surface-container-low', rgbFromArgb(neutral.tone(10))],
			['--md-sys-color-surface-container', rgbFromArgb(neutral.tone(12))],
			['--md-sys-color-surface-container-high', rgbFromArgb(neutral.tone(17))],
			[
				'--md-sys-color-surface-container-highest',
				rgbFromArgb(neutral.tone(22)),
			],
		]);

		if (mode === 'light') {
			return lightColors;
		} else {
			return new Map([...lightColors.entries(), ...darkColors.entries()]);
		}
	};

	function rgbFromArgb(value) {
		return `${redFromArgb(value)}, ${greenFromArgb(value)}, ${blueFromArgb(value)}`;
	}

	function setSchemeProperties(target, scheme, suffix = '') {
		for (const [key, value] of Object.entries(scheme.toJSON())) {
			const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			const color = rgbFromArgb(value);
			target.style.setProperty(`--md-sys-color-${token}${suffix}`, color);
		}
	}

	function applyTheme(theme, options) {
		const target = options?.target || document.body;
		const isDark = options?.dark ?? false;
		const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
		setSchemeProperties(target, scheme);
		if (options?.brightnessSuffix) {
			setSchemeProperties(target, theme.schemes.dark, '-dark');
			setSchemeProperties(target, theme.schemes.light, '-light');
		}
		if (options?.paletteTones) {
			const tones = options?.paletteTones ?? [];
			for (const [key, palette] of Object.entries(theme.palettes)) {
				const paletteKey = key
					.replace(/([a-z])([A-Z])/g, '$1-$2')
					.toLowerCase();
				for (const tone of tones) {
					const token = `--md-ref-palette-${paletteKey}-${paletteKey}${tone}`;
					const color = hexFromArgb(palette.tone(tone));
					target.style.setProperty(token, color);
				}
			}
		}
	}

	function setTheme(sourceColor, dark) {
		const theme = themeFromSourceColor(argbFromHex(sourceColor));

		// Check if the user has dark mode turned on
		// const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		// Apply the theme to the body by updating custom properties for material tokens
		applyTheme(theme, { target: document.documentElement, dark: dark });
		const missing = getMissingColorMap(theme, dark ? 'dark' : 'light');
		missing.forEach((color, token) =>
			document.documentElement.style.setProperty(token, color)
		);
	}
	window.setTheme = setTheme;
	let color = '#68548E';
	setInterval(() => {
		const dsmColor = DSM?.pluginSettings?.['set-primary-color']?.primaryColor;
		if (dsmColor && dsmColor !== color) {
			color = dsmColor;
			setTheme(color, darkMode);
		}
	}, 10);
})();

const int2 = setInterval(() => {
	try {
		if (!Calc) return;
		clearInterval(int2);
		Calc.graphSettings.backgroundColor = '#00000000';
		try {
			if (orig) Calc.controller.grapher.gridLayer.redrawToCtx = orig;
		} catch (e) {}
		const orig = Calc.controller.grapher.gridLayer.redrawToCtx.bind(
			Calc.controller.grapher.gridLayer
		);
		Calc.controller.grapher.gridLayer.redrawToCtx = ((...args) => {
			const ctx = Calc.controller.grapher.canvasLayer.ctx;
			const origStroke = ctx.stroke.bind(ctx);
			const computed = getComputedStyle(ctx.canvas);
			const col = computed.color
				.replaceAll('rgb(', '')
				.replaceAll('rgba(', '')
				.replaceAll(')', '')
				.split(', ')
				.slice(0, 3);
			const c =
				'#' +
				col.map((v) => parseInt(v).toString(16).padStart(2, '0')).join('');
			Calc.controller.grapher.settings.config.setProperty(
				'backgroundColor',
				computed.backgroundColor
			);
			Calc.setOptions({ textColor: c });
			ctx.stroke = (() => {
				const origStrokeStyle = ctx.strokeStyle;

				if (ctx.strokeStyle.startsWith('rgba')) {
					const a = parseFloat(ctx.strokeStyle.split(', ')[3].slice(0, -1));
					ctx.strokeStyle = `rgba(${col.join(', ')}, ${a})`;
				}
				origStroke();
				ctx.strokeStyle = origStrokeStyle;
			}).bind(ctx);
			const r = orig(...args);
			ctx.stroke = origStroke;
			return r;
		}).bind(Calc.controller.grapher.gridLayer);
	} catch (e) {}
}, 10);
