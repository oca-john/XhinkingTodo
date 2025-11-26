import { Github, Heart, Code } from "lucide-react";
import { Language } from "../types";
import { t } from "../i18n";
import { APP_VERSION, APP_NAME, APP_AUTHOR } from "../version";

interface AboutPanelProps {
  language: Language;
}

function AboutPanel({ language }: AboutPanelProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl shadow-lg">
          <img src="/icon-128.png" alt="XhinkingTodo" className="w-16 h-16 rounded-2xl" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{APP_NAME}</h1>
        <p className="text-gray-600">{t("about.description_text", language)}</p>
        <div className="mt-3 text-sm text-gray-500">Version {APP_VERSION}</div>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="text-base">📝</span>
            {t("about.description", language)}
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t("about.description_text", language)}
          </p>
        </section>

        {/* Features */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-base">✨</span>
            {t("about.features", language)}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_1", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_2", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_3", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_4", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_5", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_6", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_7", language)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 text-xs">•</span>
              <span className="text-xs text-gray-700">{t("about.feature_8", language)}</span>
            </li>
          </ul>
        </section>

        {/* Tech Stack */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Code className="w-4 h-4" />
            {t("about.tech_stack", language)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-3 rounded border border-gray-300">
              <div className="font-semibold text-xs text-gray-700">{t("about.tech_frontend", language)}</div>
              <div className="text-[10px] text-gray-600 mt-1">React + TypeScript</div>
            </div>
            <div className="bg-gray-100 p-3 rounded border border-gray-300">
              <div className="font-semibold text-xs text-gray-700">{t("about.tech_backend", language)}</div>
              <div className="text-[10px] text-gray-600 mt-1">Rust + Tauri</div>
            </div>
            <div className="bg-gray-100 p-3 rounded border border-gray-300">
              <div className="font-semibold text-xs text-gray-700">{t("about.tech_ui", language)}</div>
              <div className="text-[10px] text-gray-600 mt-1">TailwindCSS + Lucide</div>
            </div>
            <div className="bg-gray-100 p-3 rounded border border-gray-300">
              <div className="font-semibold text-xs text-gray-700">{t("about.tech_bundler", language)}</div>
              <div className="text-[10px] text-gray-600 mt-1">Vite</div>
            </div>
          </div>
        </section>

        {/* Data Location */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="text-base">💾</span>
            {t("about.data_storage", language)}
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-gray-700 mb-1">Windows</div>
              <code className="block bg-gray-100 px-2 py-1.5 rounded border border-gray-300 text-xs break-all">
                %APPDATA%\com.xhinking.todo\data.json
              </code>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-1">Linux</div>
              <code className="block bg-gray-100 px-2 py-1.5 rounded border border-gray-300 text-xs break-all">
                ~/.local/share/com.xhinking.todo/data.json
              </code>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 border-t">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <a
              href="#"
              className="flex items-center gap-1 hover:text-blue-600 transition"
            >
              <Github className="w-3 h-3" />
              GitHub
            </a>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>{t("about.made_with", language)}</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>{t("about.by", language)} {APP_AUTHOR}</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            © 2025 {APP_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPanel;
