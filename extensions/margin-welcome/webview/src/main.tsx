/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Mazen Zwin and Tacet contributors. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { StrictMode } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { post, readInit, syncDarkClass } from './vscode';

syncDarkClass();
const init = readInit();
createRoot(document.getElementById('root')!).render(<StrictMode><LazyMotion features={domAnimation}><App init={init} /></LazyMotion></StrictMode>);
post({ type: 'ready' });
