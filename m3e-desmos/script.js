const theme = 'dark';

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

	function setSchemeProperties(target, scheme, suffix = '', name = '') {
		for (const [key, value] of Object.entries(scheme.toJSON())) {
			const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			const color = rgbFromArgb(value);
			target.style.setProperty(
				`--md-sys-color${name}-${token}${suffix}`,
				color
			);
		}
	}

	function applyTheme(theme, options, name = '') {
		const target = options?.target || document.body;
		const isDark = options?.dark ?? false;
		const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
		setSchemeProperties(target, scheme, '', name);
		if (options?.brightnessSuffix) {
			setSchemeProperties(target, theme.schemes.dark, '-dark', name);
			setSchemeProperties(target, theme.schemes.light, '-light', name);
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

	function setTheme(sourceColor, dark, name = '') {
		const theme = themeFromSourceColor(argbFromHex(sourceColor));

		// Check if the user has dark mode turned on
		// const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		// Apply the theme to the body by updating custom properties for material tokens
		applyTheme(theme, { target: document.body, dark: dark }, name);
		const missing = getMissingColorMap(theme, dark);
		missing.forEach((color, token) =>
			document.body.style.setProperty(token, color)
		);
	}
	window.setTheme = setTheme;
	let color = '#68548E';
	setInterval(() => {
		const dsmColor = DSM?.pluginSettings?.['set-primary-color']?.primaryColor;
		if (dsmColor && dsmColor !== color) {
			color = dsmColor;
			setTheme(color, theme);
		}
	}, 10);
	setTheme('#048218', theme, '-graphing');
	setTheme('#9b2cc2', theme, '-geometry');
	setTheme('#ea4bd1', theme, '-3d');
})();
