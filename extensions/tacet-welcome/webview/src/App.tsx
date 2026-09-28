/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Tacet first boot (design/FIRST-BOOT.md): Look, Bring your settings (only when a source
// exists), Where your notes live, Extras; then the page clears. Enter continues, Esc skips.

import * as React from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';

import {
	CheckRow, MotionPrefs, PrimaryButton, RadioRow, RadioRows, SecondaryButton, Segmented, SkipButton, Stepper, SwitchRow,
} from './controls';
import { TacetMark } from './mark';
import { onHostMessage, post, type Extras, type InitData, type NotesChoice, type ReduceMotion, type ThemeChoice } from './vscode';

type StepId = 'look' | 'import' | 'notes' | 'extras';

const SIZE_MIN = 12;
const SIZE_MAX = 28;
const SIZE_DEFAULT = 17;
const EXIT = { duration: 0.11, ease: [0.3, 0, 1, 1] as const };
const ENTER = { duration: 0.16, ease: [0, 0, 0, 1] as const };

function fmt(template: string, ...args: (string | number)[]): string {
	return template.replace(/\{(\d+)\}/g, (m, i) => (args[Number(i)] ?? m).toString());
}

function usePrefersReduced(): boolean {
	const query = '(prefers-reduced-motion: reduce)';
	const [v, setV] = React.useState(() => matchMedia(query).matches);
	React.useEffect(() => {
		const mq = matchMedia(query);
		const on = () => setV(mq.matches);
		mq.addEventListener('change', on);
		return () => mq.removeEventListener('change', on);
	}, []);
	return v;
}

export function App({ init }: { init: InitData }) {
	const s = init.strings;
	const steps = React.useMemo<StepId[]>(() => init.sources.length ? ['look', 'import', 'notes', 'extras'] : ['look', 'notes', 'extras'], [init.sources.length]);

	const [stepIndex, setStepIndex] = React.useState(0);
	const [leaving, setLeaving] = React.useState<null | 'finish' | 'skip'>(null);
	const [altHeld, setAltHeld] = React.useState(false);

	const [theme, setTheme] = React.useState<ThemeChoice>(init.theme);
	const [fontSize, setFontSize] = React.useState(init.fontSize);
	const [source, setSource] = React.useState<string>('defaults');
	const [copyShortcuts, setCopyShortcuts] = React.useState(true);
	const [copySettings, setCopySettings] = React.useState(true);
	const [importLine, setImportLine] = React.useState<string>('');
	const [notesChoice, setNotesChoice] = React.useState<NotesChoice>(init.notes.choice);
	const [customPath, setCustomPath] = React.useState<string | undefined>(init.notes.customPath);
	const [extras, setExtras] = React.useState<Extras>(init.extras);

	const [hostReduce, setHostReduce] = React.useState<ReduceMotion>(init.reduceMotion);
	const prefersReduced = usePrefersReduced();
	const reduced = hostReduce === 'on' || (hostReduce === 'auto' && prefersReduced);
	React.useEffect(() => {
		document.documentElement.classList.toggle('m-reduced', reduced);
		document.documentElement.dataset.reducedMotion = String(reduced);
	}, [reduced]);

	const step = steps[stepIndex];
	const total = steps.length;

	// Host replies.
	const customPathRef = React.useRef(customPath);
	customPathRef.current = customPath;
	React.useEffect(() => onHostMessage(m => {
		if (m.type === 'importResult') {
			setImportLine(m.line);
		} else if (m.type === 'folderPicked') {
			if (m.path) {
				setCustomPath(m.path);
				setNotesChoice('custom');
			} else if (!customPathRef.current) {
				setNotesChoice('documents');
			}
			// Focus comes back from the folder dialog: put it on the selected row.
			setTimeout(() => document.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus(), 0);
		} else if (m.type === 'reduceMotion') {
			setHostReduce(m.value);
		}
	}), []);

	const notesPath = (choice: NotesChoice) => choice === 'documents' ? init.notes.documentsPath : choice === 'local' ? init.notes.localPath : (customPath ?? '');

	// ---- actions -------------------------------------------------------------------------
	const busy = leaving !== null;

	const primary = React.useCallback(() => {
		if (busy) {
			return;
		}
		if (step === 'look') {
			post({ type: 'commitLook', theme, fontSize });
		} else if (step === 'import') {
			const copying = source !== 'defaults';
			post({ type: 'commitImport', sourceId: copying ? source : null, shortcuts: copying && copyShortcuts, settings: copying && copySettings });
		} else if (step === 'notes') {
			if (notesChoice === 'custom' && !customPath) {
				pickFolder();
				return;
			}
			post({ type: 'commitNotes', choice: notesChoice, path: notesPath(notesChoice) });
		} else if (step === 'extras') {
			post({ type: 'commitExtras', extras });
			setLeaving('finish');
			return;
		}
		setStepIndex(i => Math.min(i + 1, total - 1));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [busy, step, theme, fontSize, source, copyShortcuts, copySettings, notesChoice, customPath, extras, total]);

	const back = React.useCallback(() => {
		if (!busy) {
			setStepIndex(i => Math.max(0, i - 1));
		}
	}, [busy]);

	const skip = React.useCallback(() => {
		if (!busy) {
			setLeaving('skip');
		}
	}, [busy]);

	const pickFolder = () => {
		setNotesChoice('custom');
		post({ type: 'pickFolder' });
	};

	// ---- keyboard map (FIRST-BOOT section 8) -----------------------------------------------------
	// Keys handled here do not reach the workbench (the webview host forwards unhandled keys).
	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Alt') {
				document.documentElement.classList.add('m-kbd');
			}
			const target = e.target as HTMLElement | null;
			const role = target?.getAttribute('role');
			let handled = true;
			if (e.key === 'Alt') {
				setAltHeld(true);
				e.preventDefault();
			} else if (e.key === 'Escape') {
				skip();
			} else if (e.altKey && !e.ctrlKey && e.key === 'ArrowLeft') {
				back();
			} else if (e.altKey && !e.ctrlKey && (e.code === 'KeyC' || e.code === 'KeyB' || e.code === 'KeyS')) {
				if (e.code === 'KeyC') {
					primary();
				} else if (e.code === 'KeyB') {
					back();
				} else {
					skip();
				}
			} else if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
				const isPlainButton = target?.tagName === 'BUTTON' && role !== 'radio' && role !== 'switch' && role !== 'checkbox';
				if (isPlainButton) {
					handled = false; // the focused button activates itself
				} else {
					e.preventDefault(); // a switch or checkbox must not toggle on Enter
					primary();
				}
			} else {
				handled = false;
			}
			if (handled) {
				e.preventDefault();
				e.stopPropagation();
			} else if (e.key === 'Enter') {
				e.stopPropagation();
			}
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Alt') {
				setAltHeld(false);
				e.preventDefault();
				e.stopPropagation();
			}
		};
		const onBlur = () => setAltHeld(false);
		const onPointer = () => document.documentElement.classList.remove('m-kbd');
		window.addEventListener('pointerdown', onPointer, true);
		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);
		window.addEventListener('blur', onBlur);
		return () => {
			window.removeEventListener('keydown', onKeyDown, true);
			window.removeEventListener('keyup', onKeyUp, true);
			window.removeEventListener('blur', onBlur);
			window.removeEventListener('pointerdown', onPointer, true);
		};
	}, [primary, back, skip]);

	// ---- per-step content ----------------------------------------------------------------
	const headingId = `h-${step}`;
	let heading: React.ReactNode;
	let headingText: string;
	let line: string;
	let body: React.ReactNode;
	let primaryLabel = s.continue;

	if (step === 'look') {
		headingText = s.lookHeading;
		heading = <span className="flex items-center gap-3"><TacetMark size={36} />{s.lookHeading}</span>;
		line = s.lookLine;
		body = (
			<>
				<div className="mt-8">
					<div id="lbl-theme" className="text-[14px] leading-5 font-semibold text-ink">{s.theme}</div>
					<div className="mt-2">
						<Segmented
							labelId="lbl-theme"
							value={theme}
							autoFocus
							testId="theme"
							options={[{ value: 'system', label: s.system }, { value: 'light', label: s.light }, { value: 'dark', label: s.dark }]}
							onChange={v => { setTheme(v); post({ type: 'previewTheme', theme: v }); }}
						/>
					</div>
				</div>
				<div className="mt-6">
					<div id="lbl-size" className="text-[14px] leading-5 font-semibold text-ink">{s.textSize}</div>
					<div className="mt-2">
						<Stepper labelId="lbl-size" value={fontSize} min={SIZE_MIN} max={SIZE_MAX} defaultValue={SIZE_DEFAULT} onChange={setFontSize} strings={{ decrease: s.decrease, increase: s.increase, reset: s.reset }} />
					</div>
					<p className="mt-4 mb-0 text-ink" style={{ fontSize, lineHeight: `${Math.round(fontSize * 28 / 17)}px` }} data-testid="sample">{s.sample}</p>
				</div>
			</>
		);
	} else if (step === 'import') {
		headingText = s.importHeading;
		heading = s.importHeading;
		line = s.importLine;
		const copying = source !== 'defaults';
		primaryLabel = copying ? s.copyAndContinue : s.continue;
		body = (
			<div className="mt-8 -mx-3">
				<RadioRows label={s.importHeading} value={source} onChange={setSource} testId="import-source">
					{init.sources.map(src => (
						<RadioRow
							key={src.id}
							value={src.id}
							selected={source === src.id}
							label={src.label}
							secondary={src.path}
							autoFocus={source === src.id}
							testId={`source-${src.id}`}
							below={source === src.id && (
								<div className="pb-2 pl-7">
									<CheckRow id="copy-shortcuts" label={s.shortcuts} checked={copyShortcuts} onChange={setCopyShortcuts} testId="copy-shortcuts" />
									<CheckRow id="copy-settings" label={s.editorSettings} checked={copySettings} onChange={setCopySettings} testId="copy-settings" />
									<div className="mt-1 text-[12px] leading-4 text-ink2" data-testid="import-preview">{src.preview}</div>
									<div className="mt-2 text-[12px] leading-4 text-ink2">{s.noExtensions}</div>
								</div>
							)}
						/>
					))}
					<RadioRow value="defaults" selected={source === 'defaults'} label={s.defaults} autoFocus={source === 'defaults'} testId="source-defaults" />
				</RadioRows>
			</div>
		);
	} else if (step === 'notes') {
		headingText = s.notesHeading;
		heading = s.notesHeading;
		line = s.notesLine;
		const makes = (exists: boolean) => exists ? null : <span className="text-ink3"> · {s.willCreate}</span>;
		body = (
			<>
				{importLine && <div className="mt-2 text-[12px] leading-4 text-ink2" data-testid="import-result">{importLine}</div>}
				<div className="mt-8 -mx-3">
					<RadioRows
						label={s.notesHeading}
						value={notesChoice}
						testId="notes"
						onChange={v => {
							setNotesChoice(v as NotesChoice);
						}}
					>
						<RadioRow
							value="documents"
							selected={notesChoice === 'documents'}
							label={s.notesDocuments}
							secondary={<>{init.notes.documentsPath}{makes(init.notes.documentsExists)}</>}
							below={init.notes.oneDrive && <div className="pb-2 pl-7 text-[12px] leading-4 text-ink2" data-testid="onedrive-line">{s.oneDriveLine}</div>}
							autoFocus={notesChoice === 'documents'}
							testId="notes-documents"
						/>
						{init.notes.oneDrive && (
							<RadioRow
								value="local"
								selected={notesChoice === 'local'}
								label={s.notesLocal}
								secondary={<>{init.notes.localPath}{makes(init.notes.localExists)}</>}
								autoFocus={notesChoice === 'local'}
								testId="notes-local"
							/>
						)}
						<RadioRow
							value="custom"
							selected={notesChoice === 'custom'}
							label={s.notesCustom}
							secondary={customPath}
							autoFocus={notesChoice === 'custom'}
							testId="notes-custom"
							below={
								<div className="pb-2 pl-7">
									<button type="button" className="rounded-[4px] text-[12px] leading-4 text-link" onClick={pickFolder} data-testid="choose-folder">{s.chooseFolder}</button>
								</div>
							}
						/>
					</RadioRows>
				</div>
			</>
		);
	} else {
		headingText = s.extrasHeading;
		heading = s.extrasHeading;
		line = s.extrasLine;
		primaryLabel = s.startWriting;
		const onArrows = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
				return;
			}
			const all = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="switch"]'));
			const i = all.indexOf(document.activeElement as HTMLElement);
			if (i >= 0) {
				e.preventDefault();
				all[(i + (e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length].focus();
			}
		};
		const set = (k: keyof Extras) => (v: boolean) => setExtras(x => ({ ...x, [k]: v }));
		body = (
			<div className="mt-8 -mx-3 flex flex-col" onKeyDown={onArrows} data-testid="extras">
				<SwitchRow id="x-status" label={s.statusLine} checked={extras.statusBar} onChange={set('statusBar')} autoFocus testId="extra-statusBar" />
				<SwitchRow id="x-lines" label={s.lineNumbers} checked={extras.lineNumbers} onChange={set('lineNumbers')} testId="extra-lineNumbers" />
				<SwitchRow id="x-term" label={s.terminal} checked={extras.terminal} onChange={set('terminal')} testId="extra-terminal" />
				<SwitchRow id="x-spell" label={s.spelling} checked={extras.spelling} onChange={set('spelling')} testId="extra-spelling" />
			</div>
		);
	}

	const stepLine = fmt(s.stepOf, stepIndex + 1, total);
	const announcement = `${fmt(s.stepAnnounce, stepIndex + 1, total)} ${headingText}. ${line}`;

	return (
		<MotionPrefs.Provider value={{ reduced }}>
			<MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
				<div className="sr-only" aria-live="polite" data-testid="announce">{leaving ? '' : announcement}</div>
				<AnimatePresence onExitComplete={() => { if (leaving) { post({ type: 'done', how: leaving }); } }}>
					{!leaving && (
						<motion.main key="setup" className="m-column" exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : EXIT} data-testid="setup">
							<AnimatePresence mode="wait" initial={false}>
								<motion.section
									key={step}
									role="region"
									aria-labelledby={headingId}
									data-step={step}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: reduced ? { duration: 0 } : ENTER }}
									exit={{ opacity: 0, transition: reduced ? { duration: 0 } : EXIT }}
								>
									<div className="tabular text-[12px] leading-4 text-ink2" data-testid="step-line">{stepLine}</div>
									<h1 id={headingId} className="m-heading m-0 mt-2 text-ink">{heading}</h1>
									<p className="m-0 mt-2 text-[14px] leading-5 text-ink2">{line}</p>
									{body}
									<div className="m-button-row mt-8 flex items-center gap-2">
										<PrimaryButton label={primaryLabel} hint={s.enter} accessKey="c" altHeld={altHeld} onClick={primary} />
										{stepIndex > 0 && <SecondaryButton label={s.back} accessKey="b" altHeld={altHeld} onClick={back} testId="back" />}
										<SkipButton label={s.skip} hint={s.esc} accessKey="s" altHeld={altHeld} onClick={skip} />
									</div>
								</motion.section>
							</AnimatePresence>
						</motion.main>
					)}
				</AnimatePresence>
			</MotionConfig>
		</MotionPrefs.Provider>
	);
}
