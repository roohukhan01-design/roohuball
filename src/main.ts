import './style.css';
import * as G from './game';
import * as Online from './online';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// The game's buttons call these functions from inline onclick handlers.
Object.assign(window, G, Online);

if (Capacitor.isNativePlatform()) {
  App.addListener('backButton', () => {
    if (!G.isInGame()) {
      App.exitApp();
    } else if (window.confirm('Leave this game? Your progress will be lost.')) {
      G.home();
    }
  });
}
