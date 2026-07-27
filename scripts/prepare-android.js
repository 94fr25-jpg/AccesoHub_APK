const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const android = path.join(root, 'android');
if (!fs.existsSync(android)) {
  console.error('No existe android/. Ejecuta primero: npx cap add android');
  process.exit(1);
}

const pkgDir = path.join(android, 'app', 'src', 'main', 'java', 'com', 'crecegt', 'accesohub');
fs.mkdirSync(pkgDir, { recursive: true });
fs.writeFileSync(path.join(pkgDir, 'MainActivity.java'), `package com.crecegt.accesohub;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  public class ExternalBrowserBridge {
    @JavascriptInterface
    public void openExternal(String url) {
      runOnUiThread(() -> {
        try {
          Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
          intent.addCategory(Intent.CATEGORY_BROWSABLE);
          startActivity(intent);
        } catch (Exception error) {
          if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
              "window.dispatchEvent(new CustomEvent('externalopenerror'));", null
            );
          }
        }
      });
    }
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().addJavascriptInterface(new ExternalBrowserBridge(), "AccesoHubNative");
    }
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
          getBridge().getWebView().evaluateJavascript(
            "window.dispatchEvent(new Event('nativebackbutton'));", null
          );
        }
      }
    });
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().postDelayed(() ->
        getBridge().getWebView().evaluateJavascript(
          "window.dispatchEvent(new Event('nativeappresume'));", null
        ), 120
      );
    }
  }
}
`);

// Nombre visible de la aplicación
const strings = path.join(android, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
if (fs.existsSync(strings)) {
  let s = fs.readFileSync(strings, 'utf8');
  s = s.replace(/<string name="app_name">[\s\S]*?<\/string>/, '<string name="app_name">AccesoHub</string>');
  s = s.replace(/<string name="title_activity_main">[\s\S]*?<\/string>/, '<string name="title_activity_main">AccesoHub</string>');
  fs.writeFileSync(strings, s);
}

// Iconos preparados previamente; elimina los adaptativos para evitar que sustituyan el logo.
const res = path.join(android, 'app', 'src', 'main', 'res');
for (const d of ['mipmap-anydpi-v26']) {
  fs.rmSync(path.join(res, d), { recursive: true, force: true });
}
for (const density of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi']) {
  const src = path.join(root, 'android-branding', `mipmap-${density}`);
  const dst = path.join(res, `mipmap-${density}`);
  fs.mkdirSync(dst, { recursive: true });
  for (const name of ['ic_launcher.png','ic_launcher_round.png']) {
    fs.copyFileSync(path.join(src, name), path.join(dst, name));
  }
}

// Garantiza que Android use el icono y admite enlaces externos.
const manifest = path.join(android, 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifest)) {
  let m = fs.readFileSync(manifest, 'utf8');
  m = m.replace(/android:icon="[^"]+"/, 'android:icon="@mipmap/ic_launcher"');
  m = m.replace(/android:roundIcon="[^"]+"/, 'android:roundIcon="@mipmap/ic_launcher_round"');
  fs.writeFileSync(manifest, m);
}
console.log('Android preparado: navegador externo, restauración, nombre, icono y botón Atrás.');
