import { useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';

import { SplittingText } from '@/components/animate-ui/primitives/texts/splitting';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { RadioGroup, RadioGroupItem } from '@/components/animate-ui/components/radix/radio-group';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { post, type ThemeChoice } from './vscode';

const CHOICES: { value: ThemeChoice; label: string }[] = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' },
];

export function App() {
	const reduce = useReducedMotion() ?? false;
	const [theme, setTheme] = useState<ThemeChoice>('light');

	return (
		<MotionConfig reducedMotion="user">
			<main className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
				<div className="flex w-full max-w-md flex-col gap-8" data-reduced-motion={reduce ? 'true' : 'false'}>
					<h1 className="text-4xl font-semibold tracking-tight">
						<SplittingText
							text="Welcome to Margin"
							type="chars"
							stagger={0.035}
							initial={{ y: 24, opacity: 0, filter: 'blur(6px)' }}
							animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
							disableAnimation={reduce}
						/>
					</h1>

					<motion.section
						className="flex flex-col gap-4"
						initial={reduce ? false : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: reduce ? 0 : 0.7, duration: 0.4, ease: 'easeOut' }}
					>
						<p className="text-sm text-muted-foreground">Select a theme.</p>
						<RadioGroup
							value={theme}
							onValueChange={(v) => setTheme(v as ThemeChoice)}
							className="flex gap-6"
							aria-label="Theme"
						>
							{CHOICES.map((c) => (
								<label key={c.value} className="flex cursor-pointer items-center gap-2 text-sm">
									<RadioGroupItem value={c.value} id={`theme-${c.value}`} data-testid={`theme-${c.value}`} />
									{c.label}
								</label>
							))}
						</RadioGroup>
					</motion.section>

					<motion.div
						initial={reduce ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: reduce ? 0 : 1.0, duration: 0.4 }}
					>
						<AnimateIcon animateOnHover asChild>
							<Button data-testid="continue" onClick={() => post({ type: 'continue', theme })}>
								Continue
								<ArrowRight />
							</Button>
						</AnimateIcon>
					</motion.div>
				</div>
			</main>
		</MotionConfig>
	);
}
