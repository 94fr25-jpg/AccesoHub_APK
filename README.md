# AccesoHub — Proyecto APK

Este repositorio convierte `www/index.html` en una aplicación Android mediante Capacitor.

## Crear la APK desde GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta**, incluyendo `.github`.
3. Abre la pestaña **Actions**.
4. Entra en **Construir APK** y pulsa **Run workflow**.
5. Espera a que el proceso termine con una marca verde.
6. Abre la ejecución y descarga el artefacto **AccesoHub-APK**.
7. Descomprime el archivo y encontrarás `AccesoHub-prueba.apk`.

La APK generada es una versión **debug instalable**, adecuada para probarla durante varias horas en tu teléfono. Android puede pedir autorización para instalar aplicaciones desconocidas.

## Actualizar la aplicación

Reemplaza `www/index.html` por una versión nueva, conserva el mismo nombre y vuelve a subir el cambio a GitHub. Cada `push` a `main` construirá otra APK automáticamente.

## Botón Atrás de Android

`MainActivity.java` intercepta el botón físico y envía el evento `nativebackbutton` al HTML. El evento activa el botón flotante `appBackButton`, evitando que la aplicación se cierre de golpe mientras navegas.

## Compilar localmente

Requisitos: Node.js 22, Java 21 y Android SDK.

```bash
npm install
npm run android:init
npm run android:debug
```

APK local:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Publicación final

Para Google Play necesitarás una compilación **release firmada** y preferiblemente un archivo AAB. No publiques una APK debug como versión comercial.

## Versión 7.0 — navegador externo y regreso exacto

Los accesos web se abren mediante un `Intent.ACTION_VIEW` en el navegador predeterminado de Android. La APK permanece en segundo plano. Al regresar, restaura el espacio público o privado, el filtro activo y la posición vertical exacta donde estaba el usuario. No vuelve automáticamente al portal Público/Privado.
