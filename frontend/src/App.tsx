import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Layout } from './Layout';
import { Onboarding } from './pages/Onboarding';
import { api } from './api/client';
import { Dashboard } from './pages/Dashboard';

import { Messages } from './pages/Messages';
import { Analytics } from './pages/Analytics';
import { Media } from './pages/Media';
import { Settings } from './pages/Settings';

const HAS_ONBOARDED_KEY = 'archiver_has_onboarded';

function App() {
    const [checking, setChecking] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const needsOnboardingRef = useRef(false);
    const openQueueRef = useRef<Array<{ argv: string[]; cwd: string; timestamp: number }>>([]);

    const handleOpenRequest = (payload: { argv: string[]; cwd: string; timestamp: number }) => {
        // Minimal behavior: route to dashboard and log payload
        console.log('Open request:', payload);
        window.location.hash = '#/';
    };

    const flushOpenQueue = () => {
        while (openQueueRef.current.length > 0) {
            const payload = openQueueRef.current.shift();
            if (payload) handleOpenRequest(payload);
        }
    };

    useEffect(() => {
        const electron = (window as any)?.electron;
        if (electron?.send) {
            electron.send('renderer-ready');
        }
        if (electron?.on) {
            electron.on('app:open-request', (payload: { argv: string[]; cwd: string; timestamp: number }) => {
                if (needsOnboardingRef.current) {
                    openQueueRef.current.push(payload);
                } else {
                    handleOpenRequest(payload);
                }
            });
        }
    }, []);

    useEffect(() => {
        needsOnboardingRef.current = needsOnboarding;
        if (!needsOnboarding) {
            flushOpenQueue();
        }
    }, [needsOnboarding]);

    useEffect(() => {
        let hasLocal = false;
        try {
            hasLocal = localStorage.getItem(HAS_ONBOARDED_KEY) === 'true';
        } catch {
            hasLocal = false;
        }

        if (hasLocal) {
            setNeedsOnboarding(false);
            setChecking(false);
            return;
        }

        api.getOnboardingStatus().then(status => {
            if (status?.complete) {
                try {
                    localStorage.setItem(HAS_ONBOARDED_KEY, 'true');
                } catch {
                    // ignore
                }
                setNeedsOnboarding(false);
            } else {
                setNeedsOnboarding(true);
            }
            setChecking(false);
        }).catch(() => {
            // If backend fails, default to onboarding
            console.error('Backend unreachable');
            setNeedsOnboarding(true);
            setChecking(false);
        });
    }, []);

    if (checking) {
        return (
            <div className="h-screen w-full bg-bg0 flex items-center justify-center text-pink font-mono animate-pulse">
                Initializing Vault...
            </div>
        );
    }

    if (needsOnboarding) {
        return <Onboarding onComplete={() => setNeedsOnboarding(false)} />;
    }

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="media" element={<Media />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}

export default App;
