const canResolveInBrowser =
	typeof window !== "undefined" && typeof document !== "undefined";

export const resolveApexColor = (color, fallback = "") => {
	if (typeof color !== "string") {
		return fallback || color;
	}

	const normalizedColor = color.trim();

	if (!normalizedColor) {
		return fallback;
	}

	// ApexCharts cannot parse CSS variables like `var(...)` or
	// `rgb(var(--token) / 0.9)`, so resolve them to a browser-computed color.
	if (!normalizedColor.includes("var(")) {
		return normalizedColor;
	}

	if (!canResolveInBrowser || !document.body) {
		return fallback || normalizedColor;
	}

	const probe = document.createElement("span");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";

	if (fallback) {
		probe.style.color = fallback;
	}

	document.body.appendChild(probe);
	probe.style.color = normalizedColor;

	const resolvedColor = window.getComputedStyle(probe).color;
	probe.remove();

	return resolvedColor || fallback || normalizedColor;
};
