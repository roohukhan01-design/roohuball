// Customises the Android project that "npx cap add android" generates:
// package/activity, immersive mode, portrait lock, internet access, icons, splash.
import fs from 'node:fs';
import path from 'node:path';

const MAIN = 'android/app/src/main';
const need = (p) => { if (!fs.existsSync(p)) throw new Error(`Missing ${p}. Run "npx cap add android" first.`); };
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };

// 1. Manifest: portrait only and allow Firebase network access.
const manifestPath = `${MAIN}/AndroidManifest.xml`;
need(manifestPath);
let m = fs.readFileSync(manifestPath, 'utf8');
if (!m.includes('android.permission.INTERNET')) m = m.replace('<manifest', '<manifest');
if (!m.includes('android.permission.INTERNET')) m = m.replace(/<application/, '<uses-permission android:name="android.permission.INTERNET" />\n    <application');
if (!m.includes('android:screenOrientation')) m = m.replace('<activity', '<activity android:screenOrientation="portrait"');
write(manifestPath, m);

// 2. Immersive full-screen MainActivity.
write(`${MAIN}/java/com/roohu/footballarena/MainActivity.java`, `package com.roohu.footballarena;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
`);

// 3. Dark splash + themes.
write(`${MAIN}/res/values/styles.xml`, `<?xml version="1.0" encoding="utf-8" ?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#0B0D0C</item>
        <item name="colorPrimaryDark">#0B0D0C</item>
        <item name="colorAccent">#19E36B</item>
    </style>
    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">#0B0D0C</item>
        <item name="android:windowBackground">#0B0D0C</item>
        <item name="android:statusBarColor">#0B0D0C</item>
        <item name="android:navigationBarColor">#0B0D0C</item>
    </style>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
        <item name="android:windowSplashScreenBackground">#0B0D0C</item>
    </style>
</resources>
`);
write(`${MAIN}/res/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B0D0C</color>
</resources>
`);
const res = `${MAIN}/res`;
for (const d of fs.readdirSync(res)) {
  const f = path.join(res, d, 'splash.png');
  if (d.startsWith('drawable') && fs.existsSync(f)) fs.rmSync(f);
}
write(`${res}/drawable/splash.xml`, `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item><shape android:shape="rectangle"><solid android:color="#0B0D0C" /></shape></item>
    <item><bitmap android:src="@drawable/splash_logo" android:gravity="center" /></item>
</layer-list>
`);

// 4. Icons + splash logo.
fs.cpSync('assets/android-res', res, { recursive: true });
console.log('Android project patched.');
