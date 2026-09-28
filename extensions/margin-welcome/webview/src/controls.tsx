/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Margin controls for the first boot. Built on Animate UI primitives (Radix + Motion) from
// components/animate-ui, restyled to Margin tokens and FIRST-BOOT.md §10 motion values:
// no spring overshoot, no scale-in from 0, no hover scale.

import * as React from 'react';
import { motion, type Transition } from 'motion/react';

import { RadioGroup, RadioGroupItem, RadioGroupIndicator } from '@/components/animate-ui/primitives/radix/radio-group';
import { Checkbox, useCheckbox } from '@/components/animate-ui/primitives/radix/checkbox';
import { Switch, SwitchThumb } from '@/components/animate-ui/primitives/radix/switch';
import { cn } from '@/lib/utils';

export const MotionPrefs = React.createContext<{ reduced: boolean }>({ reduced: false });

function useT(transition: Transition): Transition {
	const { reduced } = React.useContext(MotionPrefs);
	return reduced ? { duration: 0 } : transition;
}

const NO_PRESS = {};
const SEGMENT_WIDTH = 80;

/** Underlines the access-key letter while Alt is held (FIRST-BOOT section 8). */
export function AccessLabel({ text, letter, show }: { text: string; letter?: string; show: boolean }) {
	if (!letter || !show) {
		return <>{text}</>;
	}
	const i = text.toLowerCase().indexOf(letter.toLowerCase());
	if (i < 0) {
		return <>{text}</>;
	}
	return <>{text.slice(0, i)}<span className="underline underline-offset-2">{text[i]}</span>{text.slice(i + 1)}</>;
}

/**
 * Arrow keys select and focus the next radio (roving tabindex, wraps). Radix's own arrow-to-check
 * path did not fire inside the webview, so the group handles arrows itself.
 */
function onArrowSelect(e: React.KeyboardEvent<HTMLElement>, onChange: (value: string) => void, keys: { next: string[]; prev: string[] }): void {
	const dir = keys.next.includes(e.key) ? 1 : keys.prev.includes(e.key) ? -1 : 0;
	if (!dir) {
		return;
	}
	const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
	const i = radios.findIndex(r => r === document.activeElement);
	if (i < 0) {
		return;
	}
	e.preventDefault();
	e.stopPropagation();
	const next = radios[(i + dir + radios.length) % radios.length];
	const value = next.getAttribute('value');
	if (value !== null) {
		onChange(value);
	}
	next.focus();
}

// ---- Segmented control (theme) -------------------------------------------------------------

export interface SegmentOption<T extends string> { value: T; label: string }

export function Segmented<T extends string>(props: {
	labelId: string;
	value: T;
	options: SegmentOption<T>[];
	onChange: (value: T) => void;
	autoFocus?: boolean;
	testId?: string;
}) {
	const thumb = useT({ type: 'tween', duration: 0.16, ease: [0.32, 0.72, 0, 1] });
	const selectedRef = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (props.autoFocus) {
			selectedRef.current?.focus();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<RadioGroup
			aria-labelledby={props.labelId}
			value={props.value}
			onValueChange={v => props.onChange(v as T)}
			onKeyDownCapture={e => onArrowSelect(e, v => props.onChange(v as T), { next: ['ArrowRight', 'ArrowDown'], prev: ['ArrowLeft', 'ArrowUp'] })}
			orientation="horizontal"
			loop
			className="relative inline-flex h-7 items-stretch rounded-[6px] bg-sunken p-[2px]"
			data-testid={props.testId}
		>
			<motion.span
				aria-hidden="true"
				initial={false}
				animate={{ x: Math.max(0, props.options.findIndex(o => o.value === props.value)) * SEGMENT_WIDTH }}
				transition={thumb}
				className="absolute top-[2px] bottom-[2px] left-[2px] w-20 rounded-[4px] border border-quiet-edge bg-raised"
				style={{ boxShadow: 'var(--m-shadow-1)' }}
			/>
			{props.options.map(o => {
				const selected = o.value === props.value;
				return (
					<RadioGroupItem
						key={o.value}
						value={o.value}
						ref={selected ? selectedRef : undefined}
						whileHover={NO_PRESS}
						whileTap={NO_PRESS}
						data-testid={`theme-${o.value}`}
						className={cn('relative w-20 rounded-[4px] text-[14px] leading-5 outline-offset-2', selected ? 'text-ink' : 'text-ink2')}
					>
						<span className="relative">{o.label}</span>
					</RadioGroupItem>
				);
			})}
		</RadioGroup>
	);
}

// ---- Stepper (text size) --------------------------------------------------------------------

export function Stepper(props: {
	labelId: string;
	value: number;
	min: number;
	max: number;
	defaultValue: number;
	onChange: (value: number) => void;
	strings: { decrease: string; increase: string; reset: string };
}) {
	const { value, min, max } = props;
	const set = (v: number) => props.onChange(Math.min(max, Math.max(min, v)));
	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === '-' || e.key === '_' || e.key === 'ArrowDown') {
			e.preventDefault();
			set(value - 1);
		} else if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') {
			e.preventDefault();
			set(value + 1);
		}
	};
	const btn = 'flex size-7 items-center justify-center rounded-[4px] bg-sunken text-sunken-ink disabled:opacity-40';
	return (
		<div className="flex items-center" onKeyDown={onKeyDown} data-testid="text-size">
			<button type="button" className={btn} aria-label={props.strings.decrease} disabled={value <= min} onClick={() => set(value - 1)} data-testid="size-down">
				<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
			</button>
			<div
				role="spinbutton"
				tabIndex={0}
				aria-labelledby={props.labelId}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={value}
				className="tabular w-10 rounded-[4px] text-center text-[14px] leading-5 text-ink"
				data-testid="size-value"
			>
				{value}
			</div>
			<button type="button" className={btn} aria-label={props.strings.increase} disabled={value >= max} onClick={() => set(value + 1)} data-testid="size-up">
				<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
			</button>
			{value !== props.defaultValue && (
				<button type="button" className="ml-3 rounded-[4px] px-1 text-[14px] leading-5 text-link" onClick={() => set(props.defaultValue)} data-testid="size-reset">
					{props.strings.reset}
				</button>
			)}
		</div>
	);
}

// ---- Radio rows (import source, notes location) ---------------------------------------------

export function RadioRows(props: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	children: React.ReactNode;
	testId?: string;
}) {
	return (
		<RadioGroup aria-label={props.label} value={props.value} onValueChange={props.onChange} onKeyDownCapture={e => onArrowSelect(e, props.onChange, { next: ['ArrowDown', 'ArrowRight'], prev: ['ArrowUp', 'ArrowLeft'] })} orientation="vertical" loop className="flex flex-col gap-1" data-testid={props.testId}>
			{props.children}
		</RadioGroup>
	);
}

/** One radio row: 44 tall (label 14/20 + secondary 12/16), padding 0 12, radius 6, hover fill, no border at rest. */
export function RadioRow(props: {
	value: string;
	selected: boolean;
	label: string;
	secondary?: React.ReactNode;
	below?: React.ReactNode;
	autoFocus?: boolean;
	testId?: string;
}) {
	const dot = useT({ duration: 0.1, ease: [0.2, 0, 0, 1] });
	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (props.autoFocus) {
			ref.current?.focus();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="m-row rounded-[6px] px-3">
			<RadioGroupItem
				ref={ref}
				value={props.value}
				whileHover={NO_PRESS}
				whileTap={NO_PRESS}
				data-testid={props.testId}
				className="flex min-h-11 w-full items-center gap-3 py-[4px] text-left"
			>
				<span
					aria-hidden="true"
					className={cn('relative flex size-4 shrink-0 items-center justify-center rounded-full border', props.selected ? 'border-accent-fill bg-accent-fill' : 'border-edge bg-canvas')}
				>
					<RadioGroupIndicator
						className="size-[6px] rounded-full bg-accent-ink"
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.6 }}
						transition={dot}
					/>
				</span>
				<span className="flex flex-col">
					<span className="text-[14px] leading-5 text-ink">{props.label}</span>
					{props.secondary && <span className="text-[12px] leading-4 text-ink2">{props.secondary}</span>}
				</span>
			</RadioGroupItem>
			{props.below}
		</div>
	);
}

// ---- Checkbox --------------------------------------------------------------------------------

function Tick() {
	const { isChecked } = useCheckbox();
	const t = useT({ duration: 0.1, ease: [0.23, 1, 0.32, 1] });
	return (
		<motion.svg
			viewBox="0 0 16 16"
			className="size-4 text-accent-ink"
			aria-hidden="true"
			initial={false}
			animate={isChecked === true ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
			transition={isChecked === true ? t : { duration: 0 }}
		>
			<path d="M4 8.2l2.6 2.6L12 5.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</motion.svg>
	);
}

export function CheckRow(props: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; testId?: string }) {
	return (
		<div className="flex h-8 items-center gap-3">
			<Checkbox
				id={props.id}
				checked={props.checked}
				onCheckedChange={v => props.onChange(v === true)}
				whileHover={NO_PRESS}
				whileTap={NO_PRESS}
				data-testid={props.testId}
				className={cn('flex size-4 shrink-0 items-center justify-center rounded-[4px] border', props.checked ? 'border-accent-fill bg-accent-fill' : 'border-edge bg-canvas')}
			>
				<Tick />
			</Checkbox>
			<label htmlFor={props.id} className="text-[14px] leading-5 text-ink">{props.label}</label>
		</div>
	);
}

// ---- Switch row (Extras) ---------------------------------------------------------------------

/** 40 tall row, full width, label left, Windows 11 toggle at the right end (guide section 4.25). */
export function SwitchRow(props: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; autoFocus?: boolean; testId?: string }) {
	const knob = useT({ type: 'tween', duration: 0.16, ease: [0.32, 0.72, 0, 1] });
	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (props.autoFocus) {
			ref.current?.focus();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="m-row flex h-10 cursor-default items-center justify-between rounded-[6px] px-3" onClick={e => { if (e.target === e.currentTarget) { props.onChange(!props.checked); } }}>
			<label htmlFor={props.id} className="text-[14px] leading-5 text-ink">{props.label}</label>
			<Switch
				ref={ref}
				id={props.id}
				checked={props.checked}
				onCheckedChange={props.onChange}
				whileTap={NO_PRESS}
				data-testid={props.testId}
				className={cn(
					'relative flex h-5 w-10 shrink-0 items-center rounded-full border px-[2px] transition-colors duration-100',
					props.checked ? 'border-accent-fill bg-accent-fill' : 'border-edge bg-transparent'
				)}
			>
				{/* Knob: x 0 -> 20 px and size 12 -> 14 together, 160 ms tween, no bounce (FIRST-BOOT �10). */}
				<SwitchThumb
					initial={false}
					animate={{ x: props.checked ? 20 : 0, scale: props.checked ? 1 : 12 / 14 }}
					transition={knob}
					className={cn('block size-[14px] rounded-full', props.checked ? 'bg-accent-ink' : 'bg-ink2')}
				/>
			</Switch>
		</div>
	);
}

// ---- Buttons ---------------------------------------------------------------------------------

export function PrimaryButton(props: { label: string; hint: string; accessKey?: string; altHeld: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={props.onClick}
			data-testid="primary"
			className="flex h-8 items-center gap-2 rounded-[4px] bg-accent-fill px-4 text-[14px] leading-5 font-semibold text-accent-ink"
		>
			<span><AccessLabel text={props.label} letter={props.accessKey} show={props.altHeld} /></span>
			<span className="text-[12px] leading-4 font-normal opacity-70" aria-hidden="true">{props.hint}</span>
		</button>
	);
}

export function SecondaryButton(props: { label: string; accessKey?: string; altHeld: boolean; onClick: () => void; testId?: string }) {
	return (
		<button type="button" onClick={props.onClick} data-testid={props.testId} className="flex h-8 items-center rounded-[4px] bg-sunken px-4 text-[14px] leading-5 font-semibold text-sunken-ink">
			<AccessLabel text={props.label} letter={props.accessKey} show={props.altHeld} />
		</button>
	);
}

export function SkipButton(props: { label: string; hint: string; accessKey?: string; altHeld: boolean; onClick: () => void }) {
	return (
		<button type="button" onClick={props.onClick} data-testid="skip" className="m-skip ml-auto flex h-8 items-center gap-2 rounded-[4px] px-1 text-[14px] leading-5 text-ink2">
			<span><AccessLabel text={props.label} letter={props.accessKey} show={props.altHeld} /></span>
			<span className="text-[12px] leading-4 text-ink3" aria-hidden="true">{props.hint}</span>
		</button>
	);
}
