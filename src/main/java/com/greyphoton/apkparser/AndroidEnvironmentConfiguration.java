package com.greyphoton.apkparser;

import android.app.ActivityThread;
import android.app.Application;
import android.app.Instrumentation;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.res.ApkAssets;
import android.content.type.DefaultMimeMapFactory;
import android.graphics.Bitmap;
import android.os.Handler;
import android.os.Looper;
import android.util.DisplayMetrics;
import com.greyphoton.apkparser.exception.ApkReadException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import libcore.content.type.MimeMap;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.android.AndroidSdkShadowMatcher;
import org.robolectric.android.Bootstrap;
import org.robolectric.annotation.*;
import org.robolectric.config.ConfigurationRegistry;
import org.robolectric.interceptors.AndroidInterceptors;
import org.robolectric.internal.bytecode.*;
import org.robolectric.nativeruntime.DefaultNativeRuntimeLoader;
import org.robolectric.plugins.HierarchicalConfigurationStrategy.ConfigurationImpl;
import org.robolectric.res.android.CppApkAssets;
import org.robolectric.res.android.Registries;
import org.robolectric.res.android.ZipArchiveHandle;
import org.robolectric.shadow.api.Shadow;
import org.robolectric.shadows.ShadowActivityThread.ActivityThreadReflector;
import org.robolectric.shadows.ShadowApplication;
import org.robolectric.shadows.ShadowContextImpl;
import org.robolectric.shadows.ShadowPausedLooper;
import org.robolectric.util.TempDirectory;
import org.robolectric.util.inject.Injector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.URL;
import java.security.Security;
import java.util.Properties;
import java.util.zip.ZipFile;

import static org.robolectric.annotation.Config.NONE;
import static org.robolectric.util.ReflectionHelpers.callConstructor;
import static org.robolectric.util.ReflectionHelpers.setStaticField;
import static org.robolectric.util.reflector.Reflector.reflector;

/**
 * A minimal headless Android environment running on standard JVM powered by Robolectric internals.
 * Initializes Application, Context, Assets, and PackageManager without requiring JUnit,
 * AndroidX Test runners, or an emulator/device.
 */
public class AndroidEnvironmentConfiguration implements AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(AndroidEnvironmentConfiguration.class);

    private static final int DEFAULT_API_LEVEL = 34; // Android 14
    private static final String DEFAULT_DISPLAY_DENSITY = "xhdpi";

    private int apiLevel = DEFAULT_API_LEVEL;
    private String displayDensity = DEFAULT_DISPLAY_DENSITY;
    private volatile boolean initialized = false;

    public AndroidEnvironmentConfiguration() {
    }

    public AndroidEnvironmentConfiguration(int apiLevel, String displayDensity) {
        this.apiLevel = apiLevel;
        this.displayDensity = displayDensity != null ? displayDensity : DEFAULT_DISPLAY_DENSITY;
    }

    /**
     * Initializes the headless Android environment.
     * Can be invoked manually or automatically by Spring/Jakarta DI via @PostConstruct.
     */
    @PostConstruct
    public synchronized void initializeAndroidEnvironment() throws Exception {
        if (initialized) {
            log.debug("Android environment already initialized.");
            return;
        }
        log.info("Bootstrapping minimal headless Android environment (API Level: {}, Density: {})...", apiLevel, displayDensity);
        ConfigurationImpl configuration = configureAndroidEnvironment();
        setUpApplicationState(configuration);
        initialized = true;
        log.info("Headless Android environment initialized successfully.");
    }

    private ConfigurationImpl configureAndroidEnvironment() {
        System.setProperty("robolectric.offline", "true");
        Injector injector = new Injector.Builder()
                .bind(Properties.class, System.getProperties())
                .build();

        Config config = new Config.Builder()
                .setManifest(NONE)
                .setQualifiers(displayDensity)
                .setSdk(apiLevel)
                .build();

        Interceptors interceptors = new Interceptors(AndroidInterceptors.all());

        ConfigurationImpl configuration = injector.getInstance(ConfigurationImpl.class);
        configuration.put(Config.class, config);
        configuration.put(LooperMode.Mode.class, LooperMode.Mode.PAUSED);
        configuration.put(ResourcesMode.Mode.class, ResourcesMode.Mode.BINARY);
        configuration.put(SQLiteMode.Mode.class, SQLiteMode.Mode.NATIVE);
        configuration.put(GraphicsMode.Mode.class, GraphicsMode.Mode.NATIVE);
        configuration.put(ConscryptMode.Mode.class, ConscryptMode.Mode.OFF);

        ShadowProviders shadowProviders = injector.getInstance(ShadowProviders.class);
        ClassHandlerBuilder classHandlerBuilder = injector.getInstance(ClassHandlerBuilder.class);

        ShadowMap shadowMap = shadowProviders
                .getBaseShadowMap()
                .newBuilder()
                .build();

        AndroidSdkShadowMatcher shadowMatcher = new AndroidSdkShadowMatcher(apiLevel);
        ClassHandler classHandler = classHandlerBuilder.build(shadowMap, shadowMatcher, interceptors);

        setStaticField(RobolectricInternals.class, "shadowInvalidator", new ShadowInvalidator());
        setStaticField(RobolectricInternals.class, "classHandler", classHandler);
        setStaticField(RobolectricInternals.class, "classLoader", this.getClass().getClassLoader());
        setStaticField(InvokeDynamicSupport.class, "INTERCEPTORS", interceptors);

        return configuration;
    }

    private void setUpApplicationState(ConfigurationImpl configuration) throws Exception {
        setStaticField(RuntimeEnvironment.class, "apiLevel", apiLevel);

        Config config = configuration.get(Config.class);

        ConfigurationRegistry.instance = new ConfigurationRegistry(configuration.map());

        if (RuntimeEnvironment.getApplication() != null) {
            clearEnvironment();
        }

        DefaultNativeRuntimeLoader.injectAndLoad();

        RuntimeEnvironment.setTempDirectory(new TempDirectory());

        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        android.content.res.Configuration androidConfiguration = new android.content.res.Configuration();
        androidConfiguration.fontScale = config.fontScale();
        DisplayMetrics displayMetrics = new DisplayMetrics();
        Bootstrap.applyQualifiers(config.qualifiers(), apiLevel, androidConfiguration, displayMetrics);
        Bootstrap.setDisplayConfiguration(androidConfiguration, displayMetrics);
        Bitmap.setDefaultDensity(displayMetrics.densityDpi);
        MimeMap.setDefaultSupplier(DefaultMimeMapFactory::create);

        if (ShadowPausedLooper.getAllLoopers().isEmpty()) {
            ShadowPausedLooper.resetLoopers();
        }

        URL jarUrl = android.content.Context.class.getProtectionDomain().getCodeSource().getLocation();
        File sdkFile = new File(jarUrl.toURI());

        // Give the path directly to Robolectric. no temp file copying!
        RuntimeEnvironment.setAndroidFrameworkJarPath(sdkFile.toPath());
        RuntimeEnvironment.setCompileTimeSystemResources(sdkFile::toPath);

        ActivityThread activityThread = callConstructor(ActivityThread.class);
        setStaticField(ActivityThread.class, "sMainThreadHandler", new Handler(Looper.getMainLooper()));
        reflector(ActivityThreadReflector.class, activityThread).setInstrumentation(new Instrumentation());
        RuntimeEnvironment.setActivityThread(activityThread);

        Application application = new Application();
        RuntimeEnvironment.setApplicationSupplier(() -> application);

        Context contextImpl = reflector(ShadowContextImpl.ContextImplReflector.class)
                .createSystemContext(activityThread);
        reflector(ActivityThreadReflector.class, activityThread).setInitialApplication(application);
        ShadowApplication shadowApplication = Shadow.extract(application);
        shadowApplication.callAttach(contextImpl);
        reflector(ShadowContextImpl.ContextImplReflector.class, contextImpl).setOuterContext(application);
    }

    /**
     * Closes the native zip archive file backing the given ApkAssets to release file handles.
     */
    public static Long closeArchiveFileFromNativeAssets(ApkAssets apkAssets) {
        if (apkAssets == null) {
            return null;
        }
        try {
            Field nativeIdField = ApkAssets.class.getDeclaredField("mNativePtr");
            nativeIdField.setAccessible(true);
            Long nativeId = (Long) nativeIdField.get(apkAssets);
            if (nativeId == null || nativeId == 0L) {
                return null;
            }
            CppApkAssets cppApkAssets = Registries.NATIVE_APK_ASSETS_REGISTRY.getNativeObject(nativeId);
            if (cppApkAssets == null) {
                return nativeId;
            }
            Field zipHandleField = CppApkAssets.class.getDeclaredField("zip_handle_");
            zipHandleField.setAccessible(true);
            ZipArchiveHandle zipHandle = (ZipArchiveHandle) zipHandleField.get(cppApkAssets);
            if (zipHandle != null) {
                Field zipFileField = ZipArchiveHandle.class.getDeclaredField("zipFile");
                zipFileField.setAccessible(true);
                ZipFile zipFile = (ZipFile) zipFileField.get(zipHandle);
                if (zipFile != null) {
                    zipFile.close();
                }
            }
            return nativeId;
        } catch (IOException | IllegalAccessException | NoSuchFieldException e) {
            log.error("Failed to close archive file from native ApkAssets: {}", e.getMessage(), e);
            throw new ApkReadException("Failed to close archive file from native ApkAssets", e);
        }
    }

    /**
     * Clears and resets native asset managers and registries.
     */
    public synchronized void clearEnvironment() {
        try {
            Application app = RuntimeEnvironment.getApplication();
            if (app != null && app.getAssets() != null) {
                ApkAssets[] apkAssets = app.getAssets().getApkAssets();
                if (apkAssets != null && apkAssets.length > 0) {
                    closeArchiveFileFromNativeAssets(apkAssets[0]);
                }
            }
        } catch (Exception e) {
            log.warn("Non-fatal exception while closing active APK assets: {}", e.getMessage());
        } finally {
            Registries.NATIVE_APK_ASSETS_REGISTRY.clear();
            Registries.NATIVE_ASSET_MANAGER_REGISTRY.clear();
            Registries.NATIVE_ASSET_REGISTRY.clear();
        }
    }

    /**
     * Gets the current Android Application instance.
     */
    public Application getApplication() {
        ensureInitialized();
        return RuntimeEnvironment.getApplication();
    }

    /**
     * Gets the system Context instance.
     */
    public Context getContext() {
        ensureInitialized();
        return RuntimeEnvironment.getApplication();
    }

    /**
     * Gets the Android PackageManager to inspect package archives and packages.
     */
    public PackageManager getPackageManager() {
        ensureInitialized();
        return RuntimeEnvironment.getApplication().getPackageManager();
    }

    public boolean isInitialized() {
        return initialized;
    }

    private void ensureInitialized() {
        if (!initialized) {
            try {
                initializeAndroidEnvironment();
            } catch (Exception e) {
                throw new ApkReadException("Failed to initialize headless Android environment: " + e.getMessage(), e);
            }
        }
    }

    @Override
    @PreDestroy
    public synchronized void close() {
        log.debug("Destroying Android environment configuration...");
        clearEnvironment();
        initialized = false;
        log.info("Headless Android environment terminated.");
    }

    public void destroy() throws IOException {
        close();
    }

    public int getApiLevel() {
        return apiLevel;
    }

    public void setApiLevel(int apiLevel) {
        this.apiLevel = apiLevel;
    }

    public String getDisplayDensity() {
        return displayDensity;
    }

    public void setDisplayDensity(String displayDensity) {
        this.displayDensity = displayDensity;
    }

    // Fluent builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int apiLevel = DEFAULT_API_LEVEL;
        private String displayDensity = DEFAULT_DISPLAY_DENSITY;

        public Builder apiLevel(int apiLevel) {
            this.apiLevel = apiLevel;
            return this;
        }

        public Builder displayDensity(String displayDensity) {
            this.displayDensity = displayDensity;
            return this;
        }

        public AndroidEnvironmentConfiguration build() throws Exception {
            AndroidEnvironmentConfiguration config = new AndroidEnvironmentConfiguration(apiLevel, displayDensity);
            config.initializeAndroidEnvironment();
            return config;
        }
    }
}
