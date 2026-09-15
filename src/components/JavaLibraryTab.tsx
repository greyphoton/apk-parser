import React, { useState } from 'react';
import { Terminal, Copy, Check, BookOpen, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export const JavaLibraryTab: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const gradleSnippet = `repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation("com.greyphoton:apk-parser:1.0.0")
    // Real Android Framework runtime JAR for JVM
    implementation("org.robolectric:android-all:14-robolectric-10818077")
}`;

  const quickStartSnippet = `import com.greyphoton.apkparser.ApkParser;
import com.greyphoton.apkparser.model.ApkArchiveInfo;
import java.io.File;

public class Main {
    public static void main(String[] args) {
        File apkFile = new File("myapp.apk");

        // Parse APK in 3 lines using headless Robolectric runtime
        try (ApkParser parser = ApkParser.create()) {
            ApkArchiveInfo info = parser.parse(apkFile);

            System.out.println("Package Name: " + info.getPackageName());
            System.out.println("Version: " + info.getVersionName() + " (" + info.getVersionCode() + ")");
            System.out.println("Min SDK: " + info.getMinSdkVersion() + " | Target SDK: " + info.getTargetSdkVersion());
            System.out.println("Activities: " + info.getActivities().size());
            System.out.println("Permissions: " + info.getRequestedPermissions().size());

            // Extract decoded AndroidManifest.xml
            String manifestXml = parser.extractManifestXml(apkFile);
            System.out.println(manifestXml);
        }
    }
}`;

  const envConfigSnippet = `import com.greyphoton.apkparser.AndroidEnvironmentConfiguration;
import android.content.pm.PackageManager;
import android.content.pm.PackageInfo;
import java.io.File;

// Standalone or Spring Bean integration
try (AndroidEnvironmentConfiguration env = AndroidEnvironmentConfiguration.builder()
        .apiLevel(34) // Android 14
        .displayDensity("xhdpi")
        .build()) {

    PackageManager pm = env.getPackageManager();
    PackageInfo pkg = pm.getPackageArchiveInfo(
        new File("myapp.apk").getAbsolutePath(),
        PackageManager.GET_ACTIVITIES | PackageManager.GET_PERMISSIONS
    );

    System.out.println("Parsed via native PackageManager: " + pkg.packageName);
}`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
                Robolectric Headless Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                No JUnit / No Test Runners
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Standalone Java APK Parser Library
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
              Provides authentic Android <code className="text-emerald-400 font-mono">PackageManager</code>,{' '}
              <code className="text-emerald-400 font-mono">ApkAssets</code>, and{' '}
              <code className="text-emerald-400 font-mono">PackageInfo</code> resolution on any standard Java JVM
              without an Android device or emulator.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
              <div className="text-slate-400">Java Version</div>
              <div className="text-white font-semibold font-mono text-sm">JDK 17+</div>
            </div>
            <div className="px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
              <div className="text-slate-400">Robolectric Core</div>
              <div className="text-emerald-400 font-semibold font-mono text-sm">4.14.1</div>
            </div>
            <div className="px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
              <div className="text-slate-400">Target Framework</div>
              <div className="text-white font-semibold font-mono text-sm">API 34 (Android 14)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white text-base">Pure JVM Android Runtime</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Boots an in-memory Android system Context using Robolectric bytecode interceptors and shadows. Executes real framework logic without native emulators.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="font-semibold text-white text-base">No Test Runner Overhead</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Completely decouples Robolectric from JUnit, AndroidX Test, and test lifecycles. Can run in background services, web APIs, and microservices safely.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-semibold text-white text-base">Resource Leak Free</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Includes specialized native asset zip-handle disposal routines and <code className="text-blue-300 font-mono">AutoCloseable</code> lifecycle management.
          </p>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Start Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">ApkParser Quickstart</span>
            </div>
            <button
              onClick={() => copyToClipboard(quickStartSnippet, 'quickstart')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {copiedCode === 'quickstart' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'quickstart' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300 flex-1">
            <pre>{quickStartSnippet}</pre>
          </div>
        </div>

        {/* AndroidEnvironmentConfiguration Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-slate-200">AndroidEnvironmentConfiguration</span>
            </div>
            <button
              onClick={() => copyToClipboard(envConfigSnippet, 'envconfig')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {copiedCode === 'envconfig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'envconfig' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300 flex-1">
            <pre>{envConfigSnippet}</pre>
          </div>
        </div>
      </div>

      {/* Gradle Dependency Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Gradle Dependency (Kotlin DSL)</span>
          </div>
          <button
            onClick={() => copyToClipboard(gradleSnippet, 'gradle')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {copiedCode === 'gradle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode === 'gradle' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300">
          <pre>{gradleSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
