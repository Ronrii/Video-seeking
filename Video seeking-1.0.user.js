// ==UserScript==
// @name         Video seeking
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Video seeking by [ and ] keys
// @author       ronri
// @match        *://*/*
// @run-at       document-start
// @all-frames   true
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const STEP = 1;       // seek step (sec)
    const INTERVAL = 100;

    let holdInterval = null;

    const isEditable = t =>
        t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    const suppress = e => {
        e.preventDefault();
        e.stopImmediatePropagation();
    };

    const findVideo = () =>
        document.querySelector('video:focus, video:hover') || document.querySelector('video');

    const adjustTime = (v, d) => {
        const dur = v.duration || Infinity;
        v.currentTime = Math.max(0, Math.min(dur, v.currentTime + d));
    };

    const handleKey = (e, down) => {
        if (isEditable(e.target)) return;

        const map = { BracketLeft: -STEP, BracketRight: STEP };
        const delta = map[e.code];
        if (!delta) return;

        suppress(e);
        const video = findVideo();
        if (!video) return;

        if (down) {
            if (holdInterval) return;
            adjustTime(video, delta);
            holdInterval = setInterval(() => adjustTime(video, delta), INTERVAL);
        } else if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    };

    
    for (const ev of ['keydown', 'keyup']) {
        window.addEventListener(ev, e => handleKey(e, ev === 'keydown'), true);
        document.addEventListener(ev, e => handleKey(e, ev === 'keydown'), true);
    }
})();
