/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The animated Tacet mark (design/assets/animated/margin-mark-draw.svg): pen-stroke draw once,
// 880 ms; reduced motion: 200 ms fade. Decorative next to the "Tacet" heading.

export function MarginMark({ size = 36 }: { size?: number }) {
	return (
		<svg className="mm mm--draw shrink-0" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
			<defs>
				<linearGradient id="fb-paper" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="1" stopColor="#F4F6F9" />
				</linearGradient>
			</defs>
			<g className="mm-body">
				<g className="mm-page">
					<rect x="9" y="3" width="30" height="42" rx="2.5" fill="url(#fb-paper)" />
					<rect x="9.25" y="3.25" width="29.5" height="41.5" rx="2.25" fill="none" stroke="#22252B" strokeOpacity="0.16" strokeWidth="0.5" />
				</g>
				<rect className="mm-rule" x="15.25" y="3" width="1.5" height="42" fill="#2167D5" />
			</g>
		</svg>
	);
}
